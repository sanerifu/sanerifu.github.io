# Hatasız Kod Olmaz

Başlıklarım gittikçe daha az çarpıcı oluyor, nerede "Şablon Bok Çukuru" nerede bu...

## Hata Nedir

Başlıkta bahsettiğim şey _bug_ kelimesinin çevirisi olan hatalar değil _error_ kelimesinin çevirisi olan hatalar. Yani insanların kodu yazarken veya değiştirirken yaptığı hatalar değil sistemin genel işleyişi sırasında gerçekleşebilecek hatalar. En basit örneklerden birisi aralık dışı (_out of range_) okuma olabilir:

```cpp
int a = 5;
std::vector<int> v = {1, 2, 3};
int b = 6;
v[3] = 4;
```

Çok şanslıysak bu kodu derlerken derleyici bize uyarı verir. Sanırım C tarzı dizilerin (`int[10]`) uzunluğu ve kullanılan indisi derlenme zamanında belliyse derleyici uyarabiliyor ama bu her zaman olmayabiliyor, pek güvenilebilecek bir _bug_ engelleme yöntemi değil. Bunun gerçekten her şekilde mümkün olabilmesi için bağlaşık türlere (_dependent type_) ihtiyacımız var. Bağlaşık türler başka bir gönderinin konusu.

Biraz şanslıysak bu kodu derlesek bile çalışırken bize hata verir. MSVC ile hata ayıklanabilir (_debug_) modda derlendiğinde çalışma zamanı (_runtime_) ve standart kütüphane bir arada çalışarak bu tarz _bug_ hataların çalışma zamanında aykırılık (_exception_) olarak görünmesini sağlayabiliyor. Teknik olarak standarda göre bu sadece tanımsız davranış (_undefined behavior_), dolayısıyla MSVC de dağıtım (_release_) modunda derlerken standard kütüphane ve çalışma zamanı bu tarz şeylere bakmıyor. Bunu elle zorlamak için `v[3]` yerine `v.at(3)` yapabiliriz, bu metot standarda göre spesifik olarak `std::out_of_range` türünden bir _exception_ hata fırlatacaktır.

Eğer şanslı değilsek bu erişim sonucunda `v`'ye ait olmayan bir bellek bölgesinin üzerine yazarız. Bu da derleyicinin yığıtı (_stack_) nasıl yapılandırdığına göre ya `a` ya da `b` değişkeni olur. Bambaşka bir değişken de olabilir, bu `a` da `b` de sadece yazmaç (_register_) içerisinde bulunuyorsa ve yığıtta bulunmuyorsa bambaşka bir yere de yazabilir. Hatta işlevin dönüş konumuna da yazabilir ki bu da en temel sibergüvenlik saldırılarından birisidir. Tabii ki işletim sistemleri değişik yöntemlerle bunlara çözüm bulmuş durumdadır dolayısıyla günümüzde kolay kolay bu kadar basit şekilde yapılamaz ama varlığını bilmekte fayda var.

## Hatayı Yakalamak

Genel olarak birçok hata, ve Java veya Python gibi dillerde hemen hiçbir hata, bu şekilde olmaz. Genel olarak hata çalışma zamanında dilin kendi mekanizmaları üzerinden programa bildirilir. Bunun en basit örneği, yukarıda bahsettiğim `at` metodu. Bu şekildeki bir hatayı bir aykırılığa çeviriyor, böylece programımız bu hatayı görüp buna karşı bir şeyler yapabiliyor. En basit tepki genellikle bir şeyin yanlış olduğunu terminalde yazmak:

```cpp
try {
    int a = 5;
    std::vector<int> v = {1, 2, 3};
    int b = 6;
    v.at(3) = 4;
} catch(std::out_of_range const& e) {
    std::cerr << "Out of range index: " << e.what();
}
```

Aykırılıklar; C++, Java, Python, JavaScript/TypeScript ve C# gibi dillerde kullanılan temel hata belirtme yöntemi. Birçok yazılımcının da en çok kullandığı hata belirtme yöntemi aynı zamanda bu dillerin yaygınlığından ötürü. Ancak bana hep bir sorunlu gelegelmiştir aykırılıklar. C++, Python ve C# gibilerinde önemli bir eksiklik var aslında: bir işlevin ne aykırılık fırlatabildiği bilgisi belirsiz tamamen. Java'nın aykırılık sistemi çok daha fazla hoşuma gitmişti. Bir işlev, fırlatabileceği aykırılıkları imzasına koymak zorunda. İçeri `throw` mu yazdınız? `throw` ettiğiniz türü veya bunun kalıtım (_inheritance_) hiyerarşisindeki üst bir türünü `throws` sonrasında yazmanız gerekiyor. `throws` listesi boş olmayan bir metodu mu çağırdınız? Ya `try` içerisine alıp `catch` içerisinde oluşabilecek aykırılığı bir şekilde kullanacaksınız (genelde sadece hata mesajını ve çağrı yolunu yani _stacktrace_'i yazdırırsınız) ya da bu metodun `throws`'una bu aykırılık türünü veya kalıtım hiyerarşisindeki üst bir türünü yazacaksınız. Bu sayede, bazı spesifik aykırılıklar hariç bir metodun ne sorun yaşayabileceğini sadece imzasına bakarak anlayabileceğimiz anlamına geliyor. Kalıtım biraz bozuyor sadece, bütün aykırılıklar `Exception` sınıfından türediği için `throws Exception` yazıp geçilebiliyor.

C++'ta C++17 standardına kadar bununla hemen hemen aynı bir özellik var. Java'ya benzer şekilde işlevin imzasına `except(std::out_of_range, std::logic_error)` yazabiliyoruz. Fakat insanlar çok daha işlevsel olan `noexcept`'i bile düzgün kullanmıyorken Java'nın aksine derleyici tarafından zorlanmayan `except`'i kullanmıyor olacak ki yeni standartlarda direkt mevcut değil.

Peki, modern C++'ta, ve genel olarak modern dillerde hataları nasıl "yakalıyoruz"?

## Sonucu Dönmek

Rust kullanan herkes `Result<T, E>` türünü kullanmıştır herhalde. Temel olarak belirttiği şey "bu işlev ya doğru üretilmiş bir değeri döner ya da hata döner". Hatta Haskell'de benzer işleve sahip türün ismi `Either`, yani ya biri ya öteki. Modern C++ da bu yöne doğru evrilmekte, bkz. `std::expected`. Aykırılıkların en büyük avantajlarından birisi, C++ gibi dillerde bedelsiz (_zero cost_) şekilde gerçekleştirilebilmeleri (_implement_). Kod doğru çalışıyorken aykırılıklar fazladan hiçbir şey yapmıyor bir bakıma. Ama hata olduğunda baya yavaş şekilde bu hatayı yukarı taşıyor. Sonuç türlerinde bu gibi bir asimetri yok, büyük ölçüde simetrik. Genelde bir hata olsa da olmasa da bunun maliyeti tek bir `if`'ten ibaret. Ama bundan çok daha önemli bir avantajı var sonuç türlerinin. O da işlevin imzası içerisinde kesinlikle dahil olmaları, ve bu özelliğe sahip Java'nın aksine işlev zincirleri oluşturmada sorun çıkarmamaları. Mesela Java'da izlekler için kullandığımız işlevler, daha doğrusu işlev-benzeri sınıflar, herhangi bir aykırılık fırlatamaz.

```java
new Thread(() -> throw Exception("foo"));
```

gibi bir ifade ne yazık ki derlenmiyor. İzleğin iç işlevi oluşabilecek hataların hepsini kendisi çözmek zorunda, basit bir şekilde çağıran izleğe bunu bildiremiyoruz. Fakat eğer izleklerimiz bir değer dönebiliyorsa, ki eşzamansız (_asynchronous_) işlemlerde genelde gelecek değerler (_future_) üzerinden bunu gerçekleştirebiliriz, bu döndüğümüz değeri bir sonuç türü kılarak kolayca olası sorunları çağıran izleğe iletebiliriz. Ancak aykırılıklarda bir tür bant dışı (_off band_) iletişime ihtiyacımız var. Mesela izleğin sahip olacağı bir `getException` metodu. Bu metot, eğer izlek bitmişse ve bu bitiş bir aykırılık fırlatılması ile olmuşsa bize fırlatılan aykırılığı verebilir. Ama bu, açık konuşmak gerekirse, hiç de temiz değil gibi bence.

Sonuç türlerinin bir diğer avantajlarından birisi ise _monad_ özelliklerine sahip olabilmeleri.
