# Kota Mini Siang-Malam (Three.js)

- **Nama:** Arya Rangga Putra Pratama
- **NRP:** 5025241072
- **Judul Praktikum:** Grafika Komputer Pertemuan 6, Introduction to Three.js: Mini 3D Scene

## Deskripsi Scene
Untuk tugas ini saya membuat sebuah kota mini yang berisi gedung berjendela, jalan perempatan, pohon, lampu jalan, air mancur, bangku taman, galeri material, dan satu mobil merah yang bisa saya kendalikan sendiri. Matahari dan bulan saya buat mengorbit sehingga scene berganti dari siang, senja, sampai malam. Saat malam, warna latar menggelap, intensitas cahaya turun, dan jendela gedung menyala. Saya sengaja memilih ide kota supaya semua materi pertemuan ini (geometry, material, light, shadow, animasi, kamera) bisa dipakai dalam satu scene yang sama.

## Daftar Geometry
Saya memakai `BoxGeometry` untuk trotoar dan bangku taman, serta `RoundedBoxGeometry` (turunan `BoxGeometry` dengan sudut membulat) untuk gedung, atap, dan bodi mobil. `SphereGeometry` saya pakai untuk matahari, bulan, kepala lampu, tajuk pohon bulat, puncak air mancur, dan galeri material. `PlaneGeometry` saya pakai untuk ground dan jalan. `CylinderGeometry` untuk batang pohon, tiang lampu, kolam, roda, dan antena. `ConeGeometry` untuk pohon cemara, dan `TorusGeometry` untuk cincin air mancur.

## Tekstur
Semua tekstur saya buat sendiri secara prosedural lewat Canvas (`THREE.CanvasTexture`), jadi tidak ada file gambar tambahan. Teksturnya meliputi rumput berbintik, aspal dengan marka jalan, kulit kayu, daun, dan fasad gedung berjendela. Untuk jendela yang menyala saat malam, saya memakai `emissiveMap` yang hanya berisi area jendela.

## Daftar Material
`MeshLambertMaterial` saya pakai untuk gedung, ground, pohon, dan trotoar. `MeshPhongMaterial` untuk jalan, tiang lampu, air mancur, dan kaca mobil. `MeshBasicMaterial` untuk matahari, bulan, dan kepala lampu. `MeshNormalMaterial` ada di galeri dan mobil. Galeri bola dan mobil memuat keempat jenis material, supaya perbedaannya bisa saya bandingkan langsung.

## Daftar Light
Ada dua light: `AmbientLight` untuk cahaya dasar dan `DirectionalLight` yang berperan sebagai matahari dan bergerak mengorbit.

## Konfigurasi Shadow
Saya mengaktifkan `renderer.shadowMap.enabled = true` dengan tipe `PCFSoftShadowMap`. `DirectionalLight` diberi `castShadow`, begitu juga gedung, pohon, dan mobil. Ground dan jalan diberi `receiveShadow`. Shadow camera ortografik saya atur ±24 supaya seluruh kota masuk, dan ukuran shadow map bisa diganti 512/1024/2048 dengan tombol 1/2/3.

## Animasi yang Dibuat
Ada tiga animasi. Matahari dan bulan mengorbit sehingga terjadi siklus siang-malam, bola galeri berputar, dan mobil bergerak mengikuti input keyboard. Semuanya berjalan di `requestAnimationFrame` dengan `THREE.Clock` sehingga kecepatannya memakai delta time.

## Challenge yang Dikerjakan
Saya mengerjakan semua challenge, A sampai H. A (Cylinder, Cone, Torus), B (Material Gallery), C (OrthographicCamera, tombol P), D (Light Animation), E (Shadow Quality, tombol 1/2/3), F (Scene Information di HUD), G (Toggle Animation, Space), dan H (kontrol mobil dengan panah dan Q/E).

## Cara Menjalankan
```bash
npm install
npm run dev
```
Lalu buka alamat yang muncul di terminal (biasanya `http://localhost:5173/`).

## Kontrol Kamera (Mouse)
Di luar yang diminta modul, saya menambahkan `OrbitControls` supaya kota bisa dilihat dari berbagai sudut. Tahan klik kiri lalu geser untuk memutar kamera, scroll untuk zoom, dan tahan klik kanan lalu geser untuk pan. Kamera saya batasi agar tidak masuk ke bawah tanah (`maxPolarAngle`) dan jarak zoom dibatasi 8 sampai 90. Karena ada dua kamera, saya membuat dua instance kontrol dan mengaktifkan yang sesuai saat tombol P ditekan.

## Kontrol Keyboard
| Tombol | Fungsi |
|---|---|
| Mouse (geser / scroll / klik kanan) | Putar kamera / zoom / pan |
| Space | Pause / resume animasi |
| P | Perspective / Orthographic |
| Panah | Gerak mobil merah |
| Q / E | Putar mobil |
| M | Ganti material mobil |
| 1 / 2 / 3 | Shadow map 512 / 1024 / 2048 |

## Panel Eksperimen (Eksperimen Wajib 2-11)
Status eksperimen tampil di HUD. Waktu mencoba eksperimen cahaya, saya menekan **Space** saat siang supaya matahari diam dan kondisinya stabil.

| Tombol | Eksperimen |
|---|---|
| Z / X / C | #2 Segment sphere 8x6 / 32x16 / 64x32 (jumlah vertex di HUD dan Console) |
| L | #3 Matikan/hidupkan Ambient + Directional light (bandingkan Basic vs Lambert dengan M) |
| M | #3, #4, #5 Ganti material mobil (Basic, Normal, Lambert, Phong) |
| I / O | #7 Intensitas Directional (0.3, 1, 2, 4) / Ambient (0.2, 0.6, 1.0) |
| B | #8 renderer.shadowMap.enabled on/off |
| V / N | #8 mobil castShadow / ground receiveShadow on/off |
| T / Y / U | #9 FOV 35 / 60 / 90 |
| R | #10 updateProjectionMatrix saat resize on/off (lalu resize jendela) |
| D | #11 Rotasi bola galeri: 0.8 * delta vs += 0.01 per frame |

## Catatan Debugging
Selama mengerjakan, ada beberapa masalah yang saya temui dan saya selesaikan.

1. **Jalan berkedip di atas ground (z-fighting).** Awalnya jalan dan ground sama-sama berada di y = 0, jadi depth buffer tidak bisa menentukan siapa yang di depan dan permukaannya berkedip. Saya menaikkan jalan sedikit (`road.position.y = 0.02`) dan memberi selisih 0.001 antara dua jalan supaya tidak saling berkedip di perempatan.
2. **Ground dan jalan berdiri tegak.** `PlaneGeometry` secara default ada di bidang XY, jadi harus saya putar dengan `rotation.x = -Math.PI / 2` agar menjadi datar.
3. **Objek tiba-tiba hitam.** Saya sempat mengira ada yang salah di geometry atau kamera, padahal material Lambert dan Phong memang gelap tanpa cahaya. Hal ini muncul saat malam atau saat light saya matikan dengan tombol L, sedangkan material Basic (matahari, bulan, lampu) tetap terlihat.
4. **Shadow tidak ikut berubah.** Setelah `renderer.shadowMap.enabled` saya ubah dengan tombol B, material perlu dikompilasi ulang, jadi saya memanggil `material.needsUpdate = true` lewat `scene.traverse`. Untuk mengganti ukuran shadow map (tombol 1/2/3), map lama harus dibuang dengan `dispose()` dan di-null-kan agar dibuat ulang dengan ukuran baru.
5. **Shadow terpotong.** Volume shadow camera harus mencakup seluruh kota, sehingga saya atur `left/right/top/bottom` ±24 dan `far` 90.
6. **Halaman ikut bergulir saat menekan Space atau panah.** Saya menambahkan `e.preventDefault()` untuk tombol-tombol itu.
7. **Tampilan gepeng saat jendela diubah ukurannya.** Aspect kamera harus diperbarui dan `updateProjectionMatrix()` dipanggil. Untuk kamera ortografik, batas left/right/top/bottom saya hitung ulang dari aspect ratio.
8. **Animasi melompat setelah pindah tab.** Browser menghentikan frame saat tab tidak aktif, sehingga delta pertama setelah kembali sangat besar. Saya membatasinya dengan `Math.min(clock.getDelta(), 0.1)`.
9. **Toggle terpicu berkali-kali.** Menahan tombol menghasilkan event berulang, jadi toggle (Space, P, M, dan lainnya) saya proses hanya sekali dengan `if (e.repeat) return`, sedangkan gerak mobil memakai state `keys[]` agar kontinu.
10. **Warna tekstur terlihat pucat.** Tekstur warna dari Canvas harus diberi `colorSpace = SRGBColorSpace`. Untuk peta emissive (jendela menyala) tidak saya beri karena itu data, bukan warna.
11. **Tekstur fasad tidak bisa diulang per gedung.** Karena tinggi tiap gedung berbeda, saya memakai `texture.clone()` lalu mengatur `repeat` dan `needsUpdate = true` supaya jendelanya tidak melar.
12. **Kamera tidak bergerak mulus setelah memakai OrbitControls.** Mode damping membutuhkan `controls.update()` di setiap frame, dan karena ada dua kamera, yang diupdate hanya kontrol dari kamera yang sedang aktif.

## Eksperimen Wajib 1–11

**1. WebGL vs Three.js.** Saat saya bandingkan dengan materi Pertemuan 2–5, ternyata setiap konsep WebGL punya padanan di Three.js.

| Konsep Three.js | Kode di project | Padanan WebGL |
|---|---|---|
| Scene | `new THREE.Scene()` | kumpulan object yang dikelola aplikasi, dan `gl.clearColor` untuk background |
| Camera | `PerspectiveCamera`, `lookAt` | View Matrix + Projection Matrix |
| Geometry | `BoxGeometry`, `SphereGeometry`, ... | vertex/index buffer dan attribute (position, normal, uv) |
| Material | `MeshLambertMaterial`, `MeshPhongMaterial`, ... | shader program dan parameter render |
| Mesh | `new THREE.Mesh(geo, mat)` | geometry yang dirender dengan shader tertentu |
| Transform | `position`, `rotation`, `scale` | Model Matrix |
| Light | `AmbientLight`, `DirectionalLight` | perhitungan lighting di shader (ambient, diffuse) |
| Renderer | `WebGLRenderer.render()` | context, state GPU, draw call |

Kesimpulanku, Three.js adalah abstraction di atas WebGL, bukan sistem grafika yang terpisah.

**2. Segment sphere.** Jumlah vertex `SphereGeometry` adalah `(widthSegments + 1) × (heightSegments + 1)`. Dengan 8×6 ada 63 vertex (sekitar 80 segitiga), dengan 32×16 ada 561 vertex (sekitar 960 segitiga), dan dengan 64×32 ada 2145 vertex (sekitar 3968 segitiga). Angkanya juga terlihat di HUD dan Console. Makin banyak segment, bola makin halus dan siluetnya makin bulat, tetapi data vertex dan beban render ikut naik. Menurutku 8×6 jelas bersudut, 32×16 sudah cukup halus, dan 64×32 hanya sedikit lebih halus dibanding 32×16 padahal bebannya jauh lebih besar.

**3. Material tanpa light.** Saat light saya matikan dengan tombol L, mobil dengan `MeshBasicMaterial` tetap terlihat dengan warna rata, sedangkan Lambert menjadi gelap. Dari situ saya paham bahwa Basic tidak menghitung cahaya sama sekali, sedangkan Lambert menghitung diffuse dari arah cahaya dan normal permukaan. Saat light hidup, sisi Lambert yang menghadap matahari terang dan sisi lainnya gelap.

**4. MeshNormalMaterial.** Warna permukaan berasal dari vektor normal (x, y, z dipetakan ke R, G, B). Karena itu warnanya berubah saat permukaan menghadap arah berbeda. Material ini tidak membutuhkan light, dan menurutku berguna untuk memeriksa normal sebuah model.

**5. Lambert vs Phong.** Lambert hanya diffuse, jadi shading-nya halus tanpa kilap. Phong menambah specular highlight, yaitu titik terang di permukaan yang memantulkan cahaya ke arah kamera, sehingga tampak mengilap. Di galeri bola perbedaannya jelas: bola Phong punya highlight, bola Lambert tidak.

**6. Transform.** Saya tidak perlu mengubah vertex buffer secara manual. Yang mengelola Model Matrix adalah Three.js, yang menyusunnya dari `position`, `rotation`, dan `scale` lalu mengirimkannya ke shader. Hubungannya dengan Pertemuan 3 adalah translasi, rotasi, dan skala yang dikomposisikan menjadi satu matriks transformasi.

**7. Light intensity.** Dengan DirectionalLight 0.3 scene tampak redup, 1.0 normal, 2.0 terang, dan 4.0 terlalu terang sehingga warna sisi yang menghadap matahari mulai jenuh. DirectionalLight punya arah, jadi menghasilkan sisi terang, sisi gelap, dan shadow. AmbientLight menaikkan kecerahan secara merata sampai ke sisi gelap tetapi tidak membentuk shading atau shadow. Ketika ambient saya naikkan tinggi, scene jadi terlihat datar.

**8. Shadow.** Shadow hanya muncul kalau `renderer.shadowMap.enabled`, `light.castShadow`, `mesh.castShadow`, dan `ground.receiveShadow` semuanya aktif. Saat salah satunya saya matikan (tombol B, V, atau N), shadow mobil hilang. Jadi konfigurasinya memang harus lengkap di renderer, light, caster, dan receiver.

**9. FOV.** Pada 35° objek tampak lebih besar dan perspektif lebih rata, seperti di-zoom. Pada 60° tampilannya natural. Pada 90° area yang terlihat lebih luas, objek tampak lebih kecil dan jauh, dan tepi layar terlihat lebih melebar. Ini berhubungan dengan Pertemuan 4 karena FOV ikut menentukan Projection Matrix.

**10. Responsive.** Dengan `updateProjectionMatrix()` aktif, scene tetap proporsional saat jendela saya buat lebar, sempit, atau tinggi. Setelah saya matikan dengan tombol R, aspect memang berubah tetapi Projection Matrix tidak dihitung ulang, sehingga gambar tampak melar atau gepeng. Setelah saya aktifkan lagi, tampilan kembali normal.

**11. Delta time.** Dengan `rotation.y += 0.01`, kecepatan putar bergantung pada jumlah frame: di layar 144 Hz putarannya sekitar 2,4 kali lebih cepat daripada di 60 Hz. Dengan `rotation.y += 0.8 * delta`, kecepatannya dinyatakan per detik (0,8 rad/detik), jadi sama di semua frame rate. Perbandingannya bisa dicoba dengan tombol D.

## Pertanyaan Pemahaman
1. **Apa hubungan Three.js dan WebGL?**  
   Three.js adalah library JavaScript yang berada di atas WebGL dan membungkus pekerjaan low-level supaya lebih ringkas dipakai.
2. **Mengapa Three.js disebut high-level library?**  
   Disebut high-level karena saya bekerja dengan object seperti Scene, Mesh, dan Camera, bukan langsung dengan buffer, shader, dan draw call.
3. **Apakah Three.js menghilangkan konsep buffer dan shader?**  
   Tidak. Buffer dan shader tetap ada, hanya saja dikelola Three.js di belakang layar.
4. **Apa fungsi Scene?**  
   Scene adalah wadah utama yang menampung object 3D, light, dan group yang akan dirender.
5. **Apa komponen minimum agar Mesh dapat terlihat?**  
   Minimal ada Geometry dan Material yang digabung menjadi Mesh lalu ditambahkan ke Scene, ditambah Camera dan Renderer untuk menampilkannya. Kalau materialnya butuh cahaya, perlu juga Light.
6. **Apa fungsi PerspectiveCamera?**  
   `PerspectiveCamera` memberi efek perspektif, yaitu object yang lebih jauh tampak lebih kecil.
7. **Apa arti FOV?**  
   FOV (field of view) adalah sudut pandang vertikal kamera dalam derajat.
8. **Apa fungsi aspect ratio?**  
   Aspect ratio (lebar dibagi tinggi) menjaga gambar agar tidak melar atau gepeng.
9. **Apa fungsi near dan far?**  
   Near dan far adalah jarak terdekat dan terjauh dari kamera yang masih dirender.
10. **Apa fungsi `camera.lookAt()`?**  
   `camera.lookAt()` mengarahkan kamera ke sebuah titik di World Space.
11. **Apa fungsi WebGLRenderer?**  
   `WebGLRenderer` mengelola konteks WebGL dan menggambar scene dari sudut pandang kamera ke Canvas.
12. **Apa itu `renderer.domElement`?**  
   `renderer.domElement` adalah elemen `HTMLCanvasElement` yang dipakai renderer, yang saya pasang ke halaman.
13. **Apa fungsi Geometry?**  
   Geometry menentukan bentuk object, yaitu data vertex dan index-nya.
14. **Apa hubungan BufferGeometry dengan vertex buffer?**  
   `BufferGeometry` menyimpan attribute dan index dalam array bertipe, yang setara dengan vertex dan index buffer di WebGL.
15. **Attribute apa yang umum tersedia pada BufferGeometry?**  
   Attribute yang umum ada adalah `position`, `normal`, dan `uv`.
16. **Apa fungsi Material?**  
   Material menentukan bagaimana permukaan dirender, seperti warna dan responsnya terhadap cahaya.
17. **Apa karakter `MeshBasicMaterial`?**  
   `MeshBasicMaterial` tidak dipengaruhi light, jadi warnanya rata dan tetap terlihat tanpa cahaya.
18. **Apa fungsi `MeshNormalMaterial`?**  
   `MeshNormalMaterial` mewarnai permukaan berdasarkan arah normal, dan berguna untuk debugging.
19. **Apa karakter `MeshLambertMaterial`?**  
   `MeshLambertMaterial` memakai diffuse lighting sederhana dan butuh light.
20. **Apa karakter `MeshPhongMaterial`?**  
   `MeshPhongMaterial` memakai diffuse ditambah specular highlight, dan juga butuh light.
21. **Apa hubungan Geometry + Material + Mesh?**  
   Geometry (bentuk) ditambah Material (tampilan permukaan) menjadi Mesh, yaitu object yang bisa ditaruh di Scene.
22. **Apa fungsi `scene.add()`?**  
   `scene.add()` memasukkan object ke Scene supaya ikut dirender.
23. **Apa fungsi `position`?**  
   `position` mengatur letak object.
24. **Apa fungsi `rotation`?**  
   `rotation` mengatur putaran object, dalam radian.
25. **Apa fungsi `scale`?**  
   `scale` mengatur ukuran object di setiap sumbu.
26. **Bagaimana transform Three.js berhubungan dengan Model Matrix?**  
   Three.js menyusun `position`, `rotation`, dan `scale` menjadi Model Matrix.
27. **Apa itu `Object3D`?**  
   `Object3D` adalah kelas dasar untuk object di scene (mesh, light, camera, group) yang menyediakan transform dan hierarki parent-child.
28. **Apa fungsi AmbientLight?**  
   `AmbientLight` memberi pencahayaan dasar yang merata tanpa arah.
29. **Apa fungsi DirectionalLight?**  
   `DirectionalLight` meniru cahaya jauh dengan arah seragam seperti matahari, dan bisa membuat shadow.
30. **Mengapa material tertentu membutuhkan Light?**  
   Karena warna akhir material seperti Lambert dan Phong dihitung dari interaksi cahaya dengan permukaan, jadi tanpa cahaya hasilnya gelap.
31. **Apa fungsi shadow?**  
   Shadow membantu memperlihatkan kedalaman, posisi object, dan arah cahaya.
32. **Apa arti `castShadow`?**  
   `castShadow` membuat sebuah object menghasilkan bayangan.
33. **Apa arti `receiveShadow`?**  
   `receiveShadow` membuat permukaan object bisa menerima bayangan.
34. **Mengapa renderer shadow map harus diaktifkan?**  
   Karena tanpa `renderer.shadowMap.enabled`, renderer tidak memproses shadow map sama sekali.
35. **Apa fungsi animation loop?**  
   Animation loop memperbarui kondisi scene dan merendernya ulang setiap frame sehingga tampak bergerak.
36. **Mengapa menggunakan `requestAnimationFrame()`?**  
   Supaya pembaruan tampilan sejalan dengan refresh rate browser dan berhenti saat tab tidak terlihat.
37. **Apa fungsi delta time?**  
   Delta time adalah selang waktu antar frame, dipakai supaya kecepatan animasi sama di frame rate yang berbeda.
38. **Mengapa renderer harus responsif?**  
   Supaya tampilan menyesuaikan ukuran jendela dan tidak terpotong atau buram.
39. **Mengapa camera aspect harus diperbarui saat resize?**  
   Supaya proporsi gambar sesuai dengan viewport yang baru dan tidak terdistorsi.
40. **Mengapa `updateProjectionMatrix()` diperlukan?**  
   Karena mengubah `aspect` hanya mengubah nilainya, sedangkan Projection Matrix harus dihitung ulang agar perubahannya berlaku.

## Pertanyaan Analisis
**A — Abstraction.**
*Soal: Bandingkan kode WebGL manual untuk membuat cube dengan `new THREE.Mesh(geometry, material)`. Apa pekerjaan yang disederhanakan Three.js?*

Kalau membuat cube di WebGL manual, saya harus menyiapkan data vertex, membuat buffer, menulis vertex dan fragment shader, mengompilasi dan me-link program, mengatur attribute dan uniform, menghitung matriks, lalu memanggil draw call. Dengan `new THREE.Mesh(geometry, material)`, semua itu diurus Three.js, sehingga saya cukup menentukan bentuk dan tampilannya.

**B — Material.**
*Soal: Mengapa `MeshBasicMaterial` dapat terlihat tanpa Light, sedangkan `MeshLambertMaterial` membutuhkan Light?*

`MeshBasicMaterial` hanya mengeluarkan warna tetap tanpa menghitung cahaya, jadi tetap terlihat tanpa light. `MeshLambertMaterial` menghitung diffuse dari arah cahaya dan normal permukaan, sehingga tanpa light hasilnya hitam. Hal ini sudah saya buktikan sendiri dengan tombol L.

**C — Geometry.**
*Soal: Mengapa meningkatkan segment SphereGeometry membuat object lebih halus tetapi juga menambah beban geometry?*

Segment yang lebih banyak berarti lebih banyak vertex dan segitiga, sehingga lengkungannya lebih halus. Konsekuensinya data buffer, proses vertex, dan memori ikut bertambah. Contohnya sphere naik dari 561 menjadi 2145 vertex saat segment dinaikkan dari 32×16 ke 64×32.

**D — Transform.**
*Soal: Ketika menulis `mesh.position.x = 2`, apakah vertex asli harus diubah satu per satu? Jelaskan hubungannya dengan Model Matrix.*

Tidak, vertex aslinya tidak diubah. `mesh.position.x = 2` hanya mengubah nilai transform. Three.js lalu menyusunnya menjadi Model Matrix yang dikalikan dengan vertex di shader, jadi satu geometry bisa dipakai oleh banyak mesh di posisi berbeda. Itulah yang saya lakukan pada delapan pohon di scene.

**E — Shadow.**
*Soal: Mengapa shadow memerlukan konfigurasi lebih dari sekadar menambahkan Light?*

Shadow dibuat dengan merender kedalaman scene dari sudut pandang light ke sebuah shadow map, lalu hasilnya dibandingkan saat scene dirender. Karena itu renderer harus mengaktifkan shadow map, light harus membuat shadow, object harus menjadi caster, dan permukaan harus menjadi receiver. Shadow camera juga harus mencakup area scene, jika tidak shadow terpotong seperti yang saya alami.

**F — Responsive Rendering.**
*Soal: Apa yang terjadi jika renderer resize tetapi aspect camera tidak diperbarui?*

Kalau hanya renderer yang di-resize tetapi aspect kamera tidak diperbarui, Projection Matrix tetap memakai rasio lama sehingga gambar tampak melar atau gepeng dan object terlihat terdistorsi.

## Refleksi
Dibandingkan WebGL manual, mengerjakan praktikum dengan Three.js terasa jauh lebih ringkas karena buffer, shader, dan draw call sudah diurus library, sehingga saya bisa fokus ke isi scene. Abstraction yang paling membantu menurutku adalah Mesh (Geometry + Material) dan transform `position/rotation/scale` yang otomatis menjadi Model Matrix. Saya juga melihat bahwa geometry tetap berisi data vertex, terbukti dari jumlah vertex yang berubah saat segment sphere saya ganti. Material berhubungan dengan shader dan lighting, karena Basic tidak butuh light sedangkan Lambert dan Phong butuh. Konfigurasi shadow yang paling mudah terlupa adalah rantainya yang lengkap (renderer, light, caster, receiver) dan cakupan shadow camera. Delta time sangat berguna karena membuat kecepatan animasi sama di berbagai frame rate. Masalah debugging yang paling banyak menyita waktu adalah z-fighting pada jalan, plane yang berdiri tegak, dan memperbarui shadow map saat ukurannya diganti.
