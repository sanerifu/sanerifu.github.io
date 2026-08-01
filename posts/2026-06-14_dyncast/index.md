@@@date = 2026-06-14 20:54:31 +0300 Paz
@@@authors = Elif Sanem Ceyhan
@@@tags = yazılım; nesne yönelimli programlama; yazılım mimarisi

# dynamic_cast hk.

Yeterince C++ kullanmış herkes muhtemelen `dynamic_cast` gibi özellikleri görmüştür. Genel olarak öğretilen işlevi, bir sınıfı kendisinin alt sınıfına döndürmek.

```cpp
class A {};
class B : public A {};
```

diye tanımlanmışken

```cpp
std::unique_ptr<A>; a = std::make_unique<B>();
B* b = dynamic_cast<B*>(a.get());
```

şeklinde kullanabiliyoruz. Eğer `a` değişkeni gerçekten `B` olarak oluşturulmuşsa `b` gerçekten `B` işaretçisi olur ve doğru yeri gösterir, yani `std::make_unique` kısmının gerçekten oluşturduğu işaretçinin kendisini döner. Eğer değilse `nullptr` döner. Oldukça basit, değil mi?

Sorunların ilki, bunun nasıl düzenlendiği konusu aslında. C++ bize çokbiçimli (_polymorphic_) özellikleri vermek için genelde sanal tablo (_virtual table_, kısaca _vtable_) oluşturur. Vtable, bizim sanal metotlarımıza işaretçiler içeren statik bir yapıya işaret eden bir işaretçidir. Sanal bir metot çağırdığımızda kod önce bu vtable'a gider, denk gelen fonksiyonun işaretçisini bulur ve dolaylı bir çağrı gerçekleştirir. Bu sayede aynı kod, gelen nesnenin vtable'ına göre farklı işlevleri çağırabilir hâle gelir. Çokbiçimlilik de buradan sağlanır aslında. Güzel bir durum aslında, aynı kod farklı türlerle de rahatça çalışabilir, değil mi?

Sorunların ilki, bu vtable'ın `dynamic_cast` ile birlikte iletişimi. Zaten `dynamic_cast` kullanmak için vtable kullanmak zorundayız, ama genelde zaten çokbiçimli kullanılan kök sınıfımızın sanal bir yok edicisi (_destructor_) olur, öteki türlü başımızı baya ağrıtır nitekim. Dolayısıyla vtable olmaması durumu incelemeye pek değer değil. Vtable varken, `dynamic_cast` için derleyici bir tür "dönüştürücü" gömmek zorunda. Elimizde `A*` varken bu aslında `B` türündeyse bunu anlayamayız normalde. `A`'dan kalıtan (_inherit_) ama `B`'den tamamen bağımsız olan `C` türünde de olabilir. Bunun için bu farkı belirtecek bir veri parçasına ihtiyacımız var. Bu veri parçası için de derleyiciler çalışma zamanı tip bilgisi (_runtime type information_, kısaca _RTTI_) kullanır. Yani vtable aslında hangi tipe ait olduğunu kendi içine gömer. `dynamic_cast` de çalışma zamanında bu bilgiye bakarak doğru tipe çevrilip çevrilmediğini anlayabilir. Fakat sorun burada bitmiyor, bunun yanında işaretçinin kendisini ne kadar değiştirmesi gerektiğini de bir şekilde gömmek zorunda, çünkü çoklu kalıtım yapıldığında kalıtılan ikinci sınıfın bellekteki konumu kalıtan sınıfın bellekteki konumuyla bir olmuyor. Bu bilgi de yeterli değil, bütün hiyerarşiyi gömmek zorunda. `A -> B -> C` diye bir kalıtım zinciri düşünelim, `B` `A<foo>`'dan kalıtırken `C` `B`'den kalıtıyor. `C` türündeki bir nesneyi `A`'dan `B`'ye çevirirken tiplerin aynı olduğuna bakmak yeterli olmaz, `C`'nin RTTI'ının `B`'yi de içermesi gerekiyor. Bir yığın uğraş gerektiriyor yani hem derleyici için hem de çalıştıran bilgisayar için. Performans açısından ne kadar büyük bir günah olduğunu tahmin edebiliyorsunuzdur muhtemelen. Buradaki en büyük sorunlardan bir başkası RTTI'ın kendisi, Android gibi platformlarda RTTI dinamik kütüphaneler arasında ortak kullanılan tipleri aynı olarak tespit edemeyebiliyor, bu da ciddi sorunlara yol açabiliyor.

Öte taraftan bir başka devasa sorun yazılımcının gördüğü. Bir arayüz (_interface_) alıyor bir fonksiyon, ama içeride _çapraz_ bir arayüzün varlığını kontrol edip buna göre karar verebiliyor. Yani üstü kapalı bir bağımlılık var ortada. Aslında kod `B` istiyor ama `A` istediğini belirtiyor sadece. Kazıklıyor bizi bir bakıma, 3 isteyeceğini söyleyip sonrasında 5 istiyor! Tip bağlılık çizgesini (_graph_) beyinde kaybetmeye çok müsait oluyor. Bu durum genelde dinamik tipli dillerde bile pek görülmeyen bir kalıp oluyor. İnsanlar Python gibi bir dilde bile genelde doğrudan tipin kendisini varsaymaz, üstü kapalı arayüz varsayımları olur anca.

Ne yazık ki C++'ın bu durum için güzel bir çözümü yok. Eğer gerçekten bir sınıfın belli niteliklerine sadece varlarsa erişmek gibi bir ihtiyacımız varsa, öncelikle birkaç kere  daha bu ihtiyaç üzerine düşünmek gerekir, gerçekten buna ihtiyaç var mı yoksa kodu lağım çukuru gibi yazdığımız için mi gerekiyor diye. Eğer her şekilde cevabımız ilki ise, bu gereksinimi koda dökmek en doğrusu olur. Ama vtable mantığında bu pek kolay değil, dolayısıyla C++'ta yapmak hiç de basit değil. C gibi bir dil kullanıyorsak zaten çokbiçimliliği kendimiz yazdığımız için vtable mantığından en başta uzak durmak daha doğru olacaktır. Bunun yerine şişaretçi (şişman işaretçi, _fat pointer_) kullanmak daha kolay kılacaktır hayatımızı. Basitçe; çokbiçimli bir cismi, o cismi gösteren işaretçinin yanında vtable'ın kendisini yollama yöntemi oluyor bu. Vtable'ı verinin yanından çıkarmış oluyoruz bir bakıma. Eğer opsiyonel bir arayüz istiyorsak, bunu fonksiyonun imzasında belirtmek gerekir, eğer boş bir değer verilirse (örn. `nullptr`), ona göre davranabiliriz. Diğer bazı popüler dillerde de (Rust, Go) buna tam karşılık gelen bir mantık bulamadım. Genel olarak karşılaşılmaması gereken bir problem aslında, ama karşılaşılırsa düzgün çözümü bu. Elbette eğer mümkünse açık çokbiçimliliği (_open polymorphism_) kapalı çokbiçimliliğe (_closed polymorphism_) çevirmek en mantıklısı. Arayüz kavramı yerine toplam tipleri (_sum type_) kullanarak bütün ihtimalleri belirtmek daha doğru olacaktır.
