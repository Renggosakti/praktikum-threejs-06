# Kota Mini Siang-Malam (Three.js)

- **Nama:** Arya Rangga Putra Pratama
- **NRP:** 5025241072
- **Judul Praktikum:** Grafika Komputer Pertemuan 6, Introduction to Three.js: Mini 3D Scene

## Deskripsi Scene
Kota mini berisi gedung, jalan perempatan, pohon, lampu jalan, air mancur, galeri material, dan satu kubus yang bisa dikendalikan. Matahari dan bulan mengorbit sehingga scene berganti siang, senja, dan malam (warna latar, intensitas light, dan jendela gedung ikut berubah).

## Daftar Geometry
BoxGeometry (gedung, kubus), SphereGeometry (matahari, bulan, kepala lampu, galeri material), PlaneGeometry (ground dan jalan), CylinderGeometry (batang pohon, tiang lampu, kolam), ConeGeometry (daun pohon), TorusGeometry (cincin air mancur).

## Daftar Material
MeshLambertMaterial (gedung, ground, pohon), MeshPhongMaterial (jalan, tiang lampu, air mancur), MeshBasicMaterial (matahari, bulan, kepala lampu), MeshNormalMaterial (galeri dan kubus). Galeri dan kubus memuat keempat jenis material.

## Daftar Light
AmbientLight dan DirectionalLight (matahari, bergerak mengorbit).

## Konfigurasi Shadow
`renderer.shadowMap.enabled = true` (PCFSoftShadowMap), DirectionalLight `castShadow`, gedung/pohon/kubus `castShadow`, ground dan jalan `receiveShadow`. Shadow camera ortografik +/-24, ukuran shadow map dapat diganti 512/1024/2048.

## Animasi yang Dibuat
Orbit matahari dan bulan (siang-malam), rotasi bola galeri, semuanya memakai `THREE.Clock` (delta time) di `requestAnimationFrame`.

## Challenge yang Dikerjakan
A (Cylinder, Cone, Torus), B (Material Gallery), C (OrthographicCamera, tombol P), D (Light Animation), E (Shadow Quality, tombol 1/2/3), F (Scene Information di HUD), G (Toggle Animation, Space), H (Kontrol kubus, panah dan Q/E).

## Cara Menjalankan
```bash
npm install
npm run dev
```

## Kontrol Keyboard
| Tombol | Fungsi |
|---|---|
| Space | Pause / resume animasi |
| P | Perspective / Orthographic |
| Panah | Gerak kubus merah |
| Q / E | Putar kubus |
| M | Ganti material kubus |
| 1 / 2 / 3 | Shadow map 512 / 1024 / 2048 |

## Panel Eksperimen (Eksperimen Wajib 2-11)
Info status eksperimen tampil di HUD. Tekan **Space** untuk pause saat siang agar kondisi light stabil.

| Tombol | Eksperimen |
|---|---|
| Z / X / C | #2 Segment sphere 8x6 / 32x16 / 64x32 (jumlah vertex di HUD dan Console) |
| L | #3 Matikan/hidupkan Ambient + Directional light (bandingkan Basic vs Lambert dengan M) |
| M | #3, #4, #5 Ganti material kubus (Basic, Normal, Lambert, Phong) |
| I / O | #7 Intensitas Directional (0.3, 1, 2, 4) / Ambient (0.2, 0.6, 1.0) |
| B | #8 renderer.shadowMap.enabled on/off |
| V / N | #8 kubus castShadow / ground receiveShadow on/off |
| T / Y / U | #9 FOV 35 / 60 / 90 |
| R | #10 updateProjectionMatrix saat resize on/off (lalu resize jendela) |
| D | #11 Rotasi bola galeri: 0.8 * delta vs += 0.01 per frame |

## Catatan Debugging
Kendala yang ditemui (dan terlihat di kode `src/main.js`) beserta solusinya:

1. **Jalan "berkedip" menimpa ground (z-fighting).** Plane jalan dan plane ground berada pada tinggi yang sama sehingga depth buffer tidak bisa menentukan mana yang di depan. Solusi: jalan diangkat sedikit, `road.position.y = 0.02 + rot * 0.001`, dan kedua jalan diberi selisih 0.001 agar tidak saling berkedip di perempatan.
2. **Plane tampil tegak, bukan datar.** `PlaneGeometry` secara default berada di bidang XY. Solusi: `ground.rotation.x = -Math.PI / 2`.
3. **Objek terlihat hitam.** Penyebabnya material Lambert/Phong yang tidak mendapat cahaya. Dibandingkan dengan `MeshBasicMaterial` (matahari, bulan, kepala lampu) yang tetap terlihat. Di scene ini hal itu terjadi saat malam atau saat light dimatikan dengan tombol **L**.
4. **Shadow tidak mengikuti perubahan.** Saat `renderer.shadowMap.enabled` diubah (tombol **B**), material perlu dikompilasi ulang, sehingga dipanggil `material.needsUpdate = true` lewat `scene.traverse`. Saat ukuran shadow map diganti (tombol **1/2/3**), map lama harus dibuang dengan `sun.shadow.map.dispose()` dan di-null-kan agar dibuat ulang dengan ukuran baru.
5. **Shadow terpotong.** Volume shadow camera DirectionalLight harus mencakup seluruh kota, jadi diatur `left/right/top/bottom = ±24` dan `far = 90`.
6. **Halaman ikut scroll saat menekan Space/panah.** Diatasi dengan `e.preventDefault()` untuk tombol tersebut.
7. **Tampilan gepeng/terdistorsi saat resize.** Aspect camera harus diperbarui dan `updateProjectionMatrix()` dipanggil. Untuk `OrthographicCamera`, batas left/right/top/bottom dihitung ulang dari aspect ratio.
8. **Animasi melompat setelah pindah tab.** `delta` dibatasi dengan `Math.min(clock.getDelta(), 0.1)` agar tidak terjadi lonjakan besar.
9. **Event keyboard berulang.** Toggle (Space, P, M, dan lainnya) hanya diproses sekali per penekanan dengan `if (e.repeat) return`, sedangkan gerak kubus memakai state `keys[]` agar kontinu.

## Eksperimen Wajib 1–11
Pengamatan di bawah ini berdasarkan perilaku kode dan teori. Silakan cocokkan dengan yang tampil di layar saat mencoba.

**1. WebGL vs Three.js**

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

Kesimpulan: Three.js adalah abstraction di atas WebGL, bukan sistem grafika yang terpisah.

**2. Segment sphere.** Jumlah vertex `SphereGeometry` adalah `(widthSegments + 1) × (heightSegments + 1)`: 8×6 menghasilkan 63 vertex (sekitar 80 segitiga), 32×16 menghasilkan 561 vertex (sekitar 960 segitiga), dan 64×32 menghasilkan 2145 vertex (sekitar 3968 segitiga). Semakin banyak segment, permukaan makin halus dan tepi siluet makin bulat, tetapi data vertex dan beban render naik. 8×6 tampak bersudut, 32×16 sudah cukup halus, dan 64×32 hanya sedikit lebih halus dibanding 32×16.

**3. Material tanpa light.** `MeshBasicMaterial` tidak memakai perhitungan cahaya, jadi warnanya rata dan tetap terlihat saat light dimatikan (tombol **L**). `MeshLambertMaterial` menghitung diffuse dari arah cahaya dan normal, jadi saat light mati ia menjadi gelap, dan saat light hidup sisi yang menghadap cahaya terang sedangkan sisi lain gelap. Bedanya karena Basic tidak membaca light, sedangkan Lambert membutuhkannya.

**4. MeshNormalMaterial.** Warna permukaan dipetakan dari vektor normal (x, y, z menjadi R, G, B). Karena itu warna berubah mengikuti orientasi permukaan terhadap kamera. Material ini tidak membutuhkan light dan berguna untuk memeriksa normal.

**5. Lambert vs Phong.** Lambert hanya diffuse, sehingga shading halus tanpa kilap. Phong menambah specular highlight, yaitu titik terang di permukaan yang menghadap arah pantulan cahaya ke kamera, sehingga permukaan tampak mengilap. Hal ini terlihat jelas di galeri bola: bola Phong punya highlight, bola Lambert tidak.

**6. Transform.** (1) Tidak, vertex buffer tidak perlu diubah manual. (2) Three.js yang mengelola Model Matrix dari `position`, `rotation`, dan `scale`, lalu mengirimkannya ke shader. (3) Hubungannya dengan Pertemuan 3: translasi, rotasi, dan skala adalah transformasi yang dikomposisikan menjadi Model Matrix.

**7. Light intensity.** DirectionalLight 0.3 membuat scene redup, 1.0 normal, 2.0 terang, dan 4.0 cenderung terlalu terang (warna mulai jenuh di sisi yang menghadap matahari). DirectionalLight memberi arah, sehingga ada sisi terang, sisi gelap, dan shadow. AmbientLight menaikkan kecerahan merata, termasuk sisi gelap, tetapi tidak membentuk shading atau shadow. Intensitas ambient yang tinggi membuat scene tampak datar.

**8. Shadow.** Shadow hanya muncul jika `renderer.shadowMap.enabled`, `light.castShadow`, `mesh.castShadow`, dan `ground.receiveShadow` semuanya aktif. Mematikan salah satu (tombol **B**, **V**, **N**) membuat shadow kubus hilang. Karena itu shadow butuh konfigurasi di renderer, light, caster, dan receiver.

**9. FOV.** FOV 35° menyempit: objek tampak lebih besar dan perspektif lebih rata (seperti zoom). FOV 60° terlihat natural. FOV 90° melebar: area terlihat lebih luas, objek tampak kecil dan jauh, dan tepi tampak lebih melar. Terkait Pertemuan 4: FOV mengubah Projection Matrix.

**10. Responsive.** Dengan `updateProjectionMatrix()` aktif, scene tetap proporsional saat jendela diubah menjadi lebar, sempit, atau tinggi. Saat dinonaktifkan (tombol **R**), aspect berubah tetapi Projection Matrix tidak dihitung ulang, sehingga gambar tampak melar atau gepeng. Setelah diaktifkan kembali, tampilan normal.

**11. Delta time.** `rotation.y += 0.01` bergantung jumlah frame: layar 144 Hz berputar sekitar 2,4 kali lebih cepat dibanding 60 Hz. `rotation.y += 0.8 * delta` menyatakan kecepatan per detik (0,8 rad/detik), jadi sama di semua frame rate. Tombol **D** membandingkan keduanya.

## Pertanyaan Pemahaman
1. Three.js adalah library JavaScript di atas WebGL yang membungkus pekerjaan low-level agar lebih ringkas.
2. Disebut high-level karena pengguna bekerja dengan object (Scene, Mesh, Camera), bukan buffer, shader, dan draw call langsung.
3. Tidak. Buffer dan shader tetap ada, hanya dikelola Three.js di belakang layar.
4. Scene adalah container utama yang menampung object 3D, light, dan group yang akan dirender.
5. Geometry, Material, dan Mesh yang sudah ditambahkan ke Scene, serta Camera dan Renderer yang merender Scene. Material yang butuh light juga memerlukan Light.
6. `PerspectiveCamera` membuat proyeksi perspektif: objek yang lebih jauh tampak lebih kecil.
7. FOV (field of view) adalah sudut pandang vertikal kamera dalam derajat.
8. Aspect ratio (lebar/tinggi) mencegah gambar tampak melar atau gepeng.
9. Near dan far adalah jarak minimum dan maksimum dari kamera untuk objek yang masih dirender.
10. `camera.lookAt()` mengarahkan kamera ke sebuah titik di World Space.
11. `WebGLRenderer` mengelola konteks WebGL dan menggambar scene dari sudut pandang kamera ke Canvas.
12. `renderer.domElement` adalah `HTMLCanvasElement` yang dipakai renderer, yang dipasang ke halaman.
13. Geometry menentukan bentuk (data vertex dan index) sebuah object.
14. `BufferGeometry` menyimpan attribute (position, normal, uv) dan index dalam array bertipe, yang sepadan dengan vertex/index buffer di WebGL.
15. Attribute umum: `position`, `normal`, dan `uv`.
16. Material menentukan bagaimana permukaan dirender (warna, respon terhadap cahaya, dan lainnya).
17. `MeshBasicMaterial` tidak dipengaruhi light, warnanya rata.
18. `MeshNormalMaterial` mewarnai permukaan sesuai arah normal, dan berguna untuk debugging.
19. `MeshLambertMaterial` memakai diffuse lighting sederhana dan membutuhkan light.
20. `MeshPhongMaterial` memakai diffuse ditambah specular highlight, dan membutuhkan light.
21. Geometry (bentuk) + Material (tampilan permukaan) = Mesh, objek yang dapat ditempatkan di Scene.
22. `scene.add()` memasukkan object ke Scene agar ikut dirender.
23. `position` mengatur lokasi object (translasi).
24. `rotation` mengatur putaran object (dalam radian).
25. `scale` mengatur ukuran object pada tiap sumbu.
26. Three.js menghitung Model Matrix dari position, rotation, dan scale.
27. `Object3D` adalah kelas dasar object dalam scene (mesh, light, camera, group) yang menyediakan transform dan hierarki.
28. `AmbientLight` memberi pencahayaan dasar merata tanpa arah.
29. `DirectionalLight` mensimulasikan cahaya jauh dengan arah seragam, seperti matahari, dan dapat membuat shadow.
30. Karena warna akhir dihitung dari interaksi cahaya dan permukaan (normal), sehingga tanpa light hasilnya gelap.
31. Shadow memberi petunjuk kedalaman, posisi object, dan arah cahaya.
32. `castShadow` berarti object menghasilkan bayangan.
33. `receiveShadow` berarti permukaan object dapat menerima bayangan.
34. Karena tanpa `renderer.shadowMap.enabled` renderer tidak memproses shadow map sama sekali.
35. Animation loop memperbarui state dan merender ulang scene setiap frame sehingga terlihat bergerak.
36. Agar update visual diselaraskan dengan refresh rate browser dan berhenti saat tab tidak terlihat.
37. Delta time adalah selisih waktu antar frame, dipakai agar kecepatan animasi sama di berbagai frame rate.
38. Agar tampilan menyesuaikan ukuran jendela dan tidak terpotong atau buram.
39. Agar proporsi gambar sesuai ukuran viewport baru sehingga tidak terdistorsi.
40. Karena mengubah `aspect` tidak otomatis mengubah Projection Matrix, sehingga harus dihitung ulang.

## Pertanyaan Analisis
**A — Abstraction.** Di WebGL manual, cube butuh data vertex, buffer, shader (vertex dan fragment), kompilasi dan link program, pengaturan attribute dan uniform, matriks, lalu draw call. Dengan `new THREE.Mesh(geometry, material)`, Three.js menyiapkan buffer, shader, matriks, state GPU, dan draw call sehingga pengguna cukup menentukan bentuk dan tampilannya.

**B — Material.** `MeshBasicMaterial` hanya mengeluarkan warna tetap tanpa menghitung cahaya, sehingga terlihat tanpa light. `MeshLambertMaterial` menghitung diffuse dari arah light dan normal permukaan, sehingga tanpa light hasilnya hitam.

**C — Geometry.** Segment yang lebih banyak berarti lebih banyak vertex dan segitiga, sehingga lengkung lebih halus. Konsekuensinya data buffer, proses vertex, dan memori bertambah (misalnya 561 vertex menjadi 2145 vertex).

**D — Transform.** Tidak, vertex asli tidak diubah. `mesh.position.x = 2` hanya mengubah nilai transform. Three.js menyusunnya menjadi Model Matrix yang dikalikan ke vertex di shader, sehingga satu geometry bisa dipakai banyak mesh di posisi berbeda.

**E — Shadow.** Shadow dibuat dengan merender kedalaman scene dari sudut pandang light ke shadow map, lalu dibandingkan saat merender. Maka renderer harus mengaktifkannya, light harus membuat shadow, object harus menjadi caster, dan permukaan harus menjadi receiver. Shadow camera juga harus mencakup area scene.

**F — Responsive Rendering.** Jika hanya renderer yang di-resize tetapi aspect camera tidak diperbarui, Projection Matrix tetap memakai rasio lama sehingga gambar melar atau gepeng dan object tampak terdistorsi.

## Refleksi
Dibanding WebGL manual, Three.js jauh lebih ringkas karena buffer, shader, dan draw call sudah diurus library, sehingga fokus bisa ke isi scene. Abstraction yang paling membantu adalah Mesh (Geometry + Material) dan transform `position/rotation/scale` yang otomatis menjadi Model Matrix. Geometry tetap berisi vertex data (position, normal, uv), terlihat dari jumlah vertex yang berubah saat segment sphere diubah. Material berkaitan dengan shader dan lighting: Basic tidak butuh light, sedangkan Lambert dan Phong butuh light. Konfigurasi shadow yang paling mudah terlupa adalah rantai lengkapnya (renderer, light, caster, receiver) serta cakupan shadow camera. Delta time membuat kecepatan animasi konsisten di berbagai frame rate. Kendala debugging yang ditemukan terutama z-fighting jalan, plane yang tegak, dan pembaruan shadow map saat ukuran diganti.
