# Bağımlılığını Nasıl Eğitirsin

__Hiç vakit kaybetmeden not düşeyim, bu gönderi insanların bağımlılıkları ile ilgili değil. Ne alkol bağımlılığına bir çözüm bu ne de eski sevgiliye bağımlılığa. Yazılımdaki bağımlılıklardan bahsediyorum, _dependency_ terimin karşılığı olarak kullandım.__

Evet, kamu spotunu geçtiğimize göre gönderiye girebiliriz. Öncelikle, bağımlılık yani _dependency_ nedir? Bir yazılım bileşeninin derlenmek veya çalışmak için ihtiyaç duyduğu başka bir yazılım parçası diyebiliriz galiba. En genelgeçer kullanımı "üçüncü taraf bağımlılık" yani _third party dependency_ olsa gerek. Hemen her yazılım, dilin kendi standart kütüphanesi dışında bir kütüphaneye bağlı olur genel olarak. JavaScript ve TypeScript ekosisteminde NPM ile; Rust ekosisteminde Cargo ile; Python ekosisteminde Pip veya uv ile; C ve C++ ekosistemlerinde CMake, Conan, ve XMake gibi sistemlerle veya Linux dağıtımlarında doğrudan işletim sisteminin repo sistemi ile yönetilir üçüncü parti bağımlılıklar. Elbette birçoğunda elle de yapılabilir ama makinenin bu kadar rahat yaptığı bir işi insan niye yapsın? Yazılımcılar olarak amacımız otomatize etmek değil mi? Niye kendimize eziyet ettirelim?

Fakat ben burada başka bir anlamından bahsetmek istiyorum. Nesne yönelimli programlamada kullanılan bir prensip var: bağımlılık zerki (_dependency injection_). Kısacası, bir sınıf bir şeyleri kendi yaratmak yerine belli bir arayüz (_interface_) belirliyor ve kendisini kullanan üst sınıftan yapacağı şey için yaratması gereken şeyi yaratıp kendisine vermesini istiyor. Mesela bir video oynatıcısı yapacaksınız. Bu sistemin video çözücüye ihtiyacı da var elbette. Seçeneklerden birisi, oynatıcıya doğrudan videonun yolunu vermeniz ve oynatıcının direkt çalıştırması. Bunun modülerlik sorunları oluyor ama. Donanım hızlandırmalı bir çözücü kullanmak isterseniz ne oluyor? Bu özelliği seçen bir ayarı oynatıcı sınıfına koymanız gerekiyor. Çözücünün bütün ayarlarını oynatıcının da alması gerekiyor. Oldukça büyük bir sorun bu. Çözümü ise video çözücü sınıfların ortak bir arayüze sahip olması, video oynatıcının da bu arayüzü uygulayan (_implement_) bir tipi alması. Böylece çözücüyü istediğimiz gibi ayarlayabiliriz, belli şartları yani arayüzü sağladığı sürece modüler şekilde kullanabiliriz oynatıcıda. Bunun klasik uygulanışı sanal sınıflarla arayüzleri oluşturmak ve sanal metot çağrıları ile süreci yönetmek. Eğer çalışma zamanında değiştirilebilirliğe ihtiyacınız yoksa genelleştirilmiş (_generic_) sınıflar ile de aynı sonuca daha yüksek performans ile ulaşabilirsiniz. Ama kavram aynı özünde.

Daha önceki gönderilerimi okuyan ve/veya beni bilenler her fırsatta nesne yönelimli programlamayı yerdiğimi bilir. Burada yermeyeceğim ama. Bağımlılık zerkinin sanal sınıflarla yapılan türü elbette rahatsız ediyor genel olarak ama kavramın kendisi oldukça mantıklı. Kodun modülerliğini ve kullanılabilirliğini arttıran bir kavram. Bağımlılıklarımızı eğitmek için cebimizde kesinlikle bulunması gereken bir alet kısacası. Keza nsene yönelimli programlama yapmasam da kodumun bu yöntemi kullanmaya meylettiğini düzenli olarak görüyorum. Kodun temiz kalması için zarari diyebilirim yani.

Bağımlılık zerki görece öğretilen bir yöntem. Nesne yönelimli programlama eğitimlerinde, okullarda, kurslarda, işyerlerinde deneyimli yazılımcılar tarafından işte yani genel olarak yazılımla ilgili bir şeyler öğretilen hemen her yerde ucundan da olsa değiniliyor bu konuya. Nitekim bence nesne yönelimli programlamanın Liskov yerine yerleştirme ilkesi gibi taraflarından daha fazla öğretilmeli. Ben burada bariz olan ama üzerine pek konuşulmayan bir ayrımdan bahsetmek istiyorum aslında ki bu gönderiyi yazma sebebim de bu: bariz ve muma (_explicit and implicit_) bağımlılıklar.

Bu kavramlar aslında yazılımların hemen her yerine girer. Hatta bence sadece yazılım değil hemen her mühendislikte benzeri kavramlar olsa gerek. Kısacası; eğer bir bağımlılık; belge içerisinde belirtilmişse bu bariz yani açık, belirtilmemişse ve varsayılmışsa bu muma yani kapalı bir bağımlılık olur. Yazılımda genel olarak muma bağımlılıklarla fazlaca karşılaştığımız için bundan bahsetmek istiyorum. Bir kodun başka bir koda bağlaşıklık seviyesi hiç bağlaşık olmamalarından (_uncoupled_) sıkı bağlaşık olmalarına (_tightly coupled_) uzanan bir spektrum. İdeali bağlaşıksız kodlardır, birindeki değişiklikler ötekini etkilemiyorsa ne âlâ! Ama aynı yazılım içerisindeki farklı kodlar hemen her zaman sıfır olmayan bir bağlaşıklık oranına sahiptir. İşte bağımlılık eğitimi burada devreye giriyor. Bir bağımlılık bariz de olabilir muma da. En basit bir örneği verelim:

````cpp
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

Evet, artık `x` bağımlılığımız bariz hâle gelmiş durumda. `foo`nun bir hâle bağlı olduğunu fonksiyonun imzası (_function signature_) bariz şekilde gösteriyor.