# Bağımlılığını Nasıl Eğitirsin

__Hiç vakit kaybetmeden not düşeyim, bu gönderi insanların bağımlılıkları ile ilgili değil. Ne alkol bağımlılığına bir çözüm bu ne de eski sevgiliye bağımlılığa. Yazılımdaki bağımlılıklardan bahsediyorum, _dependency_ terimin karşılığı olarak kullandım.__

Evet, kamu spotunu geçtiğimize göre gönderiye girebiliriz. Öncelikle, bağımlılık yani _dependency_ nedir? Bir yazılım bileşeninin derlenmek veya çalışmak için ihtiyaç duyduğu başka bir yazılım parçası diyebiliriz galiba. En genelgeçer kullanımı "üçüncü taraf bağımlılık" yani _third party dependency_ olsa gerek. Hemen her yazılım, dilin kendi standart kütüphanesi dışında bir kütüphaneye bağlı olur genel olarak. JavaScript ve TypeScript ekosisteminde NPM ile; Rust ekosisteminde Cargo ile; Python ekosisteminde Pip veya uv ile; C ve C++ ekosistemlerinde CMake, Conan, ve XMake gibi sistemlerle veya Linux dağıtımlarında doğrudan işletim sisteminin repo sistemi ile yönetilir üçüncü parti bağımlılıklar. Elbette birçoğunda elle de yapılabilir ama makinenin bu kadar rahat yaptığı bir işi insan niye yapsın? Yazılımcılar olarak amacımız otomatize etmek değil mi? Niye kendimize eziyet ettirelim?

Fakat ben burada başka bir anlamından bahsetmek istiyorum. Nesne yönelimli programlamada kullanılan bir prensip var: bağımlılık zerki (_dependency injection_). Kısacası, bir sınıf bir şeyleri kendi yaratmak yerine belli bir arayüz (_interface_) belirliyor ve kendisini kullanan üst sınıftan yapacağı şey için yaratması gereken şeyi yaratıp kendisine vermesini istiyor. Mesela bir video oynatıcısı yapacaksınız. Bu sistemin video çözücüye ihtiyacı da var elbette. Seçeneklerden birisi, oynatıcıya doğrudan videonun yolunu vermeniz ve oynatıcının direkt çalıştırması. Bunun modülerlik sorunları oluyor ama. Donanım hızlandırmalı bir çözücü kullanmak isterseniz ne oluyor? Bu özelliği seçen bir ayarı oynatıcı sınıfına koymanız gerekiyor. Çözücünün bütün ayarlarını oynatıcının da alması gerekiyor. Oldukça büyük bir sorun bu. Çözümü ise video çözücü sınıfların ortak bir arayüze sahip olması, video oynatıcının da bu arayüzü uygulayan (_implement_) bir tipi alması. Böylece çözücüyü istediğimiz gibi ayarlayabiliriz, belli şartları yani arayüzü sağladığı sürece modüler şekilde kullanabiliriz oynatıcıda. Bunun klasik uygulanışı sanal sınıflarla arayüzleri oluşturmak ve sanal metot çağrıları ile süreci yönetmek. Eğer çalışma zamanında değiştirilebilirliğe ihtiyacınız yoksa genelleştirilmiş (_generic_) sınıflar ile de aynı sonuca daha yüksek performans ile ulaşabilirsiniz. Ama kavram aynı özünde.

Daha önceki gönderilerimi okuyan ve/veya beni bilenler her fırsatta nesne yönelimli programlamayı yerdiğimi bilir. Burada yermeyeceğim ama. Bağımlılık zerkinin sanal sınıflarla yapılan türü elbette rahatsız ediyor genel olarak ama kavramın kendisi oldukça mantıklı. Kodun modülerliğini ve kullanılabilirliğini arttıran bir kavram. Bağımlılıklarımızı eğitmek için cebimizde kesinlikle bulunması gereken bir alet kısacası. Keza nsene yönelimli programlama yapmasam da kodumun bu yöntemi kullanmaya meylettiğini düzenli olarak görüyorum. Kodun temiz kalması için zarari diyebilirim yani.

Bağımlılık zerki görece öğretilen bir yöntem. Nesne yönelimli programlama eğitimlerinde, okullarda, kurslarda, işyerlerinde deneyimli yazılımcılar tarafından işte yani genel olarak yazılımla ilgili bir şeyler öğretilen hemen her yerde ucundan da olsa değiniliyor bu konuya. Nitekim bence nesne yönelimli programlamanın Liskov yerine yerleştirme ilkesi gibi taraflarından daha fazla öğretilmeli. Ben burada bariz olan ama üzerine pek konuşulmayan bir ayrımdan bahsetmek istiyorum aslında ki bu gönderiyi yazma sebebim de bu: bariz ve muma (_explicit and implicit_) bağımlılıklar.

## Bağımlılıkları Belirginleştirme

Bu kavramlar aslında yazılımların hemen her yerine girer. Hatta bence sadece yazılım değil hemen her mühendislikte benzeri kavramlar olsa gerek. Kısacası; eğer bir bağımlılık; belge içerisinde belirtilmişse bu bariz yani açık, belirtilmemişse ve varsayılmışsa bu muma yani kapalı bir bağımlılık olur. Yazılımda genel olarak muma bağımlılıklarla fazlaca karşılaştığımız için bundan bahsetmek istiyorum. Bir kodun başka bir koda bağlaşıklık seviyesi hiç bağlaşık olmamalarından (_uncoupled_) sıkı bağlaşık olmalarına (_tightly coupled_) uzanan bir spektrum. İdeali bağlaşıksız kodlardır, birindeki değişiklikler ötekini etkilemiyorsa ne âlâ! Ama aynı yazılım içerisindeki farklı kodlar hemen her zaman sıfır olmayan bir bağlaşıklık oranına sahiptir. İşte bağımlılık eğitimi burada devreye giriyor. Bir bağımlılık bariz de olabilir muma da. En basit bir örneği verelim:

```cpp
int x = 0;

void foo(int a) {
    x += a;
    printf("%d\n", x);
}
```

Burada `foo`, `x`e bağımlı ama bunu bariz bir şekilde belirtmemiş. `a`nın artış miktarı olduğunu dokümantasyon söyleyebilir ama hâl (_state_) küresel bir değişkenin (_global variable_) arkasına saklanmış. Dolayısıyla muma bağımlılık oluyor `x`. Sadece bağımlılık eğitimi değil izlek desteği gibi sebeplerden ötürü de gerekiyor olsa da bağımlılık sorununu basitçe çözebiliriz:

```cpp
void foo(int* x, int a) {
    *x += a;
    printf("%d\n", x);
}
```

Evet, artık `x` bağımlılığımız bariz hâle gelmiş durumda. `foo`nun bir hâle bağlı olduğunu fonksiyonun imzası (_function signature_) bariz şekilde gösteriyor. Ancak bu tarz değişiklikler zaten genel olarak tavsiye edilir. Küresel (_global_) değişkenleri tavsiye eden kimse görmedim ben şimdiye dek.

Çoğunlukla bağımlılıklarla ilgili sorunlar daha farklı şekillerde tezahür ediyor. Benim en sık gördüğüm sorun sanırım metotların sınıflara bağlı olması. "Bağlı olmayacak da ne olacak?" diyebilirsiniz; sorun bu metodun, sınıfın ufak bir parçasını kullanmasında oluşuyor. Tek bir veri parçasını kullanan metot on farklı veriye bağlı gözüküyor. Her metot bu şekilde olduğu için de neyin tam olarak neye bağlı olduğunu doğrudan göremiyoruz.

Peki bağımlılığımızı nasıl eğitiriz? İlk aşama bunu çözmek. Sınıflar doğaları gereği birden fazla işi yapma eğilimine sahip. Evet SOLID'in S'si yani tek sorumluluk ilkesi (_single responsibility principle_) bu şekildeki sınıfların yanlış olduğunu söylüyor. Ama veri ile davranışı birleştirdiğimiz an yani nesne yönelimli programlamaya girdiğimizde bu ilkeyi anlamlı şekilde uygulamak pek mümkün olmuyor. Zaten doğası gereği her sınıf en az iki sorumluluğa sahip: veriyi tutmak ve o veriyi işleyen en az bir yordama sahip olmak. Öteki türlü ya serbest işlevler (_free function_) ya da düz veriler olarak tekrar yazılabilirler. Yani nesne yönelimli programlama kendisinin ilk genelgeçer kuralı ile böyle bir çelişkiye sahip. Dolayısıyla ilk aşama bu yöntemleri bırakmak oluyor. Sınıflar yerine işlevler ve veriler şeklinde düşünmek gerekiyor. Bu sayede artık her fonksiyonumuz için bağımlılıkları bariz şekilde belirtmenin yolunu açmış oluyoruz. Farklı işleri yapan işlevleri ortak bir sınıfla bağdaştırmak zorunda kalmadığımız için istediğimiz gibi bağımlılıkları bölebiliyoruz.

Bu noktadan sonra işlevlerin girdilerini ayarlama kısmı biraz damak tadına bağlı aslında. Ama farklı işlevlerde aynı şekilde gruplanmış girdi almak, kesinlikle her zaman olmasa da, biraz şüphe uyandırmalı bence. Neredeyse hiçbir iki algoritma, eğer çözdükleri problem aynı değilse, aynı girdiler almaz. Bazı insanlar girdi sayısının çokluğunu gruplandırarak çözüyor, gruplandırma yöntemi kullanılacaksa bahsettiğim durum göz önünde buludurulabilir. C veya C++'taki designated initializer özelliği gruplandırma yöntemini güzel kullanılabilir kılabiliyor. Esas sorun aslında girdilerin isminin çağırırken verilmemesi. Kaydırma yapmak fazlasıyla kolay hâle geldiği için yanlış kullanıma müsait olabiliyor bu işlevler her ne kadar bağımlılıklarını bariz şekilde gösteriyor olsalar da. Eğer kullandığınız dil girdileri isimle vermeye (_named arguments_) izin veriyorsa gruplandırmayı çok tavsiye etmiyorum. Girdilerin kendilerine geleceksek, ben belli başlı _temel_ türler dışına çıkılmaması taraftarıyım. Sayılar, metinler, diziler, eşlemeler (_map_) ve işlev işaretçileri (_function pointer_) ve bunlara referans/işaretçiler çoğu durumda yeterli olmalı ama durumunuza göre ekleme veya çıkarma yapabilirsiniz. Yine de çok elleşmemek lazım bence; bunlar çoğu dilde gerçekten temel tür olarak bulunuyor, aksi örnek olarak C'de metin yerine karakter dizisi kullanılması olabilir ama mantık aynı orada da aslında, çünkü hemen her program bunların üst üste eklenmesiyle oluşuyor.

```cpp
struct ResourceData {
    void bindTexture(size_t index, int bind_point) const { /* bind code */ }
    void bindBuffer(size_t index) const { /* bind code */ }
private:
    std::vector<Texture> textures;
    std::vector<Buffer> buffers;
};
```

Yukarıdaki örneğe bakalım mesela. Kodun çoğunu yazmadım ama temel mantık belli: `ResourceData` hem dokuları hem de veri belleklerini tutuyor ve bunlar üzerinde işlem yapıyor. En basidinden iki işlemi yazdım yukarıda. Burada dikkat ederseniz `bindTexture` veri bellekleriyle tamamen ilişkisiz olsa da dolaylı yoldan (doku bağlama kodunun veri belleği kullanması düşük ihtimal), `this` işaretçisi üzerinden, aslında veri belleklerine de bağlı oluyor. Bunu daha iyi görmenin yolu bence bu metotları düz işlev olarak yazmak:

```cpp
struct ResourceData {
    std::vector<Texture> textures;
    std::vector<Buffer> buffers;
};
void bindTexture(ResourceData const& res, size_t index, int bind_point) { /* bind code */ }
void bindBuffer(ResourceData const& res, size_t index) { /* bind code */ }
```

İlk bakışta `bindTexture`'ün aslında veri belleklerini kullanmadığını göremiyoruz bu örnekte mesela. Kodun içerisine bakmadan bu bilgiye erişmemiz mümkün değil. Benim içeri yazdığım yer tutucu yorumun içerisinde kullandığını da kullanmadığını da göremiyoruz. Zaten bir fonksiyonu kullanacaksanız muhtemelen bakış açınız bu şekilde olacaktır: sadece girdileri ve çıktılarını göreceksiniz. Burada teknik olarak çok bir sorun yok aslında. Sadece gereksiz bir girdi alıyor işlevler. Sorun, bu girdiler değiştirilebilir olduğunda asıl oluyor.

```cpp
struct ResourceData {
    std::vector<Texture> textures;
    std::vector<Buffer> buffers;
    std::vector<Framebuffer> framebuffers;
};
void createFramebuffer(ResourceData& res, size_t index) { /* create framebuffer from Framebuffer object at index */ }
void createTexture(ReourceData& res, size_t index) { /* create texture from Texture object at index */ }
```

Grafik arayüzlerini bilmeyenler için: framebuffer yani okunabilir ve yazılabilir doku kümeleri renk ve derinlik dokularının bir tür birleşimi gibi bir şey. Mesela 1920x1080 boyuta sahip; kırmızı, yeşil mavi renklere sekizer bit ayıran ve derinliği de 32 bit olarak ayarlayan bir küme oluşturmak için iki tane doku oluşturmamız ve bunları bir kümeye bağlamamız gerekiyor. Buradaki sorun fark ettiniz mi? Küme oluşturmasına rağmen dokuları da değiştiriyor bu işlev. Ancak bu bilgiyi işlevin girdilerinde tam göremiyoruz. `createFramebuffer` ve `createTexture` aynı girdileri alıyor ama bu girdilerin içerisinde farklı parçaları kullanıyor. Fonksiyonun imzası fazla geniş olduğu için fonksiyonun tam ne yaptığını bilmiyoruz, o nedenle işlevin her şeyi değiştirmiş olabileceği varsayımıyla hareket etmemiz gerekebiliyor. Gelin bu bağımlılığı bariz yapalım:

```cpp
void createFramebuffer(std::vector<Texture>& textures, std::vector<Framebuffer>& framebuffers, size_t index) {}
void createTexture(std::vector<Texture>& textures, size_t index) {}
```

Ve evet; böylece doku kümesi oluşturmak için hem doku hem küme dizilerine erişim gerektiği, doku oluşturmak için ise sadece doku dizisine erişim gerektiği bilgisini sadece ve sadece işlev girdilerine bakarak anlayabiliyoruz.

Ben yukarıdaki şekilde kod yazmayı daha rahat buluyorum açıkçası. Bir işlev tamamen imzasına bakılarak değerlendirilebiliyor böylece. Bilmiyorum, bazıları bunu kirli kod olarak görüyordur, bence tam tersine her şey açık ve bariz olduğu için fazlasıyla temiz bir kod.

## Zamansal Bağımlılık

Bana kalırsa hemen her programın en büyük belası bu arkadaş. En azından genel olarak en çok karşılaştığım hata türlerinin birçoğu bu bağımlılıkların muma kalmasından dolayı gerçekleşiyor. Birçok programda `init` ve benzeri metotlar olur. 

## İzleksel Bağımlılık
