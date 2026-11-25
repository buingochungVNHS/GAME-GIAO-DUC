/* Dữ liệu bài học. Muốn thêm bài: thêm vào GGD.TOPICS. Mỗi cụm: en, vi, ipa (giọng Mỹ). */
window.GGD = window.GGD || {};

GGD.TOPICS = [
  { id: 'life', name: 'Đời sống', icon: '🛒', lessons: [
    { id: 'life1', name: 'Mua sắm', phrases: [
      { en: 'How much is this?', vi: 'Cái này bao nhiêu tiền?', ipa: '/haʊ ˈmʌtʃ ɪz ðɪs/' },
      { en: "I'll take it.", vi: 'Tôi lấy cái này.', ipa: '/aɪl teɪk ɪt/' },
      { en: 'Can I pay by card?', vi: 'Tôi trả bằng thẻ được không?', ipa: '/kæn aɪ peɪ baɪ kɑːrd/' },
      { en: 'Do you have a smaller size?', vi: 'Bạn có cỡ nhỏ hơn không?', ipa: '/duː juː hæv ə ˈsmɔːlər saɪz/' },
      { en: "It's too expensive.", vi: 'Đắt quá.', ipa: '/ɪts tuː ɪkˈspensɪv/' }
    ] },
    { id: 'life2', name: 'Ăn uống', phrases: [
      { en: 'A table for two, please.', vi: 'Cho tôi một bàn hai người.', ipa: '/ə ˈteɪbəl fɔːr tuː pliːz/' },
      { en: 'Can I see the menu?', vi: 'Cho tôi xem thực đơn được không?', ipa: '/kæn aɪ siː ðə ˈmenjuː/' },
      { en: "I'd like some water.", vi: 'Tôi muốn xin ít nước.', ipa: '/aɪd laɪk sʌm ˈwɔːtər/' },
      { en: 'The bill, please.', vi: 'Cho tôi tính tiền.', ipa: '/ðə bɪl pliːz/' },
      { en: 'This is delicious.', vi: 'Món này ngon quá.', ipa: '/ðɪs ɪz dɪˈlɪʃəs/' }
    ] }
  ] },
  { id: 'travel', name: 'Du lịch', icon: '✈️', lessons: [
    { id: 'travel1', name: 'Sân bay', phrases: [
      { en: 'Where is the check-in counter?', vi: 'Quầy làm thủ tục ở đâu?', ipa: '/wer ɪz ðə ˈtʃek ɪn ˈkaʊntər/' },
      { en: 'Here is my passport.', vi: 'Đây là hộ chiếu của tôi.', ipa: '/hɪr ɪz maɪ ˈpæspɔːrt/' },
      { en: 'Which gate is it?', vi: 'Cổng nào vậy?', ipa: '/wɪtʃ ɡeɪt ɪz ɪt/' },
      { en: 'My flight is delayed.', vi: 'Chuyến bay của tôi bị hoãn.', ipa: '/maɪ flaɪt ɪz dɪˈleɪd/' },
      { en: 'Where is the baggage claim?', vi: 'Nơi nhận hành lý ở đâu?', ipa: '/wer ɪz ðə ˈbæɡɪdʒ kleɪm/' }
    ] },
    { id: 'travel2', name: 'Đường đi và khách sạn', phrases: [
      { en: 'Where is the station?', vi: 'Nhà ga ở đâu?', ipa: '/wer ɪz ðə ˈsteɪʃən/' },
      { en: 'Turn left at the corner.', vi: 'Rẽ trái ở góc đường.', ipa: '/tɜːrn left æt ðə ˈkɔːrnər/' },
      { en: 'I have a reservation.', vi: 'Tôi đã đặt phòng trước.', ipa: '/aɪ hæv ə ˌrezərˈveɪʃən/' },
      { en: 'What time is check-out?', vi: 'Mấy giờ trả phòng?', ipa: '/wʌt taɪm ɪz ˈtʃek aʊt/' },
      { en: 'Is breakfast included?', vi: 'Có gồm bữa sáng không?', ipa: '/ɪz ˈbrekfəst ɪnˈkluːdɪd/' }
    ] }
  ] },
  { id: 'work', name: 'Công việc', icon: '💼', lessons: [
    { id: 'work1', name: 'Làm quen', phrases: [
      { en: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.', ipa: '/naɪs tuː miːt juː/' },
      { en: 'What do you do?', vi: 'Bạn làm nghề gì?', ipa: '/wʌt duː juː duː/' },
      { en: 'I work for a company.', vi: 'Tôi làm cho một công ty.', ipa: '/aɪ wɜːrk fɔːr ə ˈkʌmpəni/' },
      { en: 'Let me introduce myself.', vi: 'Để tôi tự giới thiệu.', ipa: '/let miː ˌɪntrəˈduːs maɪˈself/' },
      { en: 'Here is my business card.', vi: 'Đây là danh thiếp của tôi.', ipa: '/hɪr ɪz maɪ ˈbɪznəs kɑːrd/' }
    ] },
    { id: 'work2', name: 'Họp hành', phrases: [
      { en: "Let's get started.", vi: 'Chúng ta bắt đầu nhé.', ipa: '/lets ɡet ˈstɑːrtɪd/' },
      { en: 'Could you repeat that?', vi: 'Bạn nhắc lại được không?', ipa: '/kʊd juː rɪˈpiːt ðæt/' },
      { en: 'I agree with you.', vi: 'Tôi đồng ý với bạn.', ipa: '/aɪ əˈɡriː wɪð juː/' },
      { en: "I'll send you an email.", vi: 'Tôi sẽ gửi email cho bạn.', ipa: '/aɪl send juː æn ˈiːmeɪl/' },
      { en: "Let's take a short break.", vi: 'Chúng ta nghỉ giải lao ngắn nhé.', ipa: '/lets teɪk ə ʃɔːrt breɪk/' }
    ] }
  ] },
  { id: 'me', name: 'Bản thân', icon: '🙂', lessons: [
    { id: 'me1', name: 'Giới thiệu bản thân', phrases: [
      { en: 'I am from Vietnam.', vi: 'Tôi đến từ Việt Nam.', ipa: '/aɪ æm frʌm ˌviːetˈnɑːm/' },
      { en: 'I live with my family.', vi: 'Tôi sống cùng gia đình.', ipa: '/aɪ lɪv wɪð maɪ ˈfæməli/' },
      { en: 'I like reading books.', vi: 'Tôi thích đọc sách.', ipa: '/aɪ laɪk ˈriːdɪŋ bʊks/' },
      { en: 'My hobby is drawing.', vi: 'Sở thích của tôi là vẽ.', ipa: '/maɪ ˈhɑːbi ɪz ˈdrɔːɪŋ/' },
      { en: 'I am learning English.', vi: 'Tôi đang học tiếng Anh.', ipa: '/aɪ æm ˈlɜːrnɪŋ ˈɪŋɡlɪʃ/' }
    ] },
    { id: 'me2', name: 'Một ngày của tôi', phrases: [
      { en: 'I get up at six.', vi: 'Tôi dậy lúc sáu giờ.', ipa: '/aɪ ɡet ʌp æt sɪks/' },
      { en: 'I usually walk to work.', vi: 'Tôi thường đi bộ đi làm.', ipa: '/aɪ ˈjuːʒuəli wɔːk tuː wɜːrk/' },
      { en: 'I love drawing dragons.', vi: 'Tôi thích vẽ rồng.', ipa: '/aɪ lʌv ˈdrɔːɪŋ ˈdræɡənz/' },
      { en: 'I go to bed at eleven.', vi: 'Tôi đi ngủ lúc mười một giờ.', ipa: '/aɪ ɡoʊ tuː bed æt ɪˈlevən/' },
      { en: 'Learning English is fun.', vi: 'Học tiếng Anh thật vui.', ipa: '/ˈlɜːrnɪŋ ˈɪŋɡlɪʃ ɪz fʌn/' }
    ] }
  ] }
];

/* Gắn id, chủ đề, bài cho từng cụm; tạo danh sách phẳng. */
GGD.ALL = [];
GGD.TOPICS.forEach(function (t) {
  t.lessons.forEach(function (l) {
    l.topicId = t.id;
    l.phrases.forEach(function (p, i) {
      p.id = l.id + '_' + (i + 1);
      p.lessonId = l.id;
      p.topicId = t.id;
      p.idx = i;
      GGD.ALL.push(p);
    });
  });
});
GGD.BY_ID = {};
GGD.ALL.forEach(function (p) { GGD.BY_ID[p.id] = p; });

/* Giai đoạn lớn lên của rồng theo số cụm đã thuộc (hộp từ 3 trở lên). */
GGD.STAGES = [
  { min: 0, name: 'Trứng rồng' },
  { min: 3, name: 'Rồng con' },
  { min: 10, name: 'Rồng nhỏ' },
  { min: 20, name: 'Rồng trẻ' },
  { min: 35, name: 'Rồng trưởng thành' }
];

/* Số ngày chờ để ôn lại theo hộp 0..5 (ôn tập ngắt quãng). */
GGD.INTERVALS = [0, 1, 2, 4, 8, 16];
GGD.LEARNED_BOX = 3;

/* Bảng 44 âm (chuẩn thường dạy ở Việt Nam; giọng Mỹ có khác biệt nhỏ ở vài âm). */
GGD.SOUNDS = [
  /* Nguyên âm đơn */
  { ipa: 'iː', g: 'mono', words: ['sheep', 'see'], tip: "Giống 'i' kéo dài. Môi kéo ngang như đang cười, lưỡi nâng cao." },
  { ipa: 'ɪ', g: 'mono', words: ['ship', 'sit'], tip: "Ngắn và thả lỏng, nằm giữa 'i' và 'ê'. Môi không kéo căng." },
  { ipa: 'ʊ', g: 'mono', words: ['book', 'put'], tip: "Ngắn, môi hơi tròn và lỏng, gần 'u' ngắn." },
  { ipa: 'uː', g: 'mono', words: ['food', 'blue'], tip: "'u' kéo dài. Môi tròn và chu ra." },
  { ipa: 'e', g: 'mono', words: ['bed', 'ten'], tip: "Gần 'e' tiếng Việt, miệng mở vừa." },
  { ipa: 'ə', g: 'mono', words: ['about', 'teacher'], tip: "Âm yếu nhất, rất ngắn, miệng thả lỏng. Thường nằm ở âm tiết không nhấn." },
  { ipa: 'ɜː', g: 'mono', words: ['bird', 'work'], tip: "Kéo dài, môi thả lỏng không tròn, gần 'ơ' kéo dài. Giọng Mỹ cuộn lưỡi nhẹ ở cuối." },
  { ipa: 'ɔː', g: 'mono', words: ['door', 'call'], tip: "'o' kéo dài, môi tròn vừa, lưỡi thấp và lùi." },
  { ipa: 'æ', g: 'mono', words: ['cat', 'bad'], tip: "Hạ hàm, miệng mở rộng ngang, nằm giữa 'e' và 'a'." },
  { ipa: 'ʌ', g: 'mono', words: ['cup', 'bus'], tip: "Ngắn, miệng mở vừa, lưỡi ở giữa, gần 'ă' hoặc 'ơ' ngắn." },
  { ipa: 'ɑː', g: 'mono', words: ['car', 'father'], tip: "'a' kéo dài, miệng mở to, lưỡi thấp." },
  { ipa: 'ɒ', g: 'mono', words: ['hot', 'box'], tip: "'o' ngắn, miệng mở tròn. Giọng Mỹ thường đọc gần /ɑː/." },
  /* Nguyên âm đôi */
  { ipa: 'ɪə', g: 'diph', words: ['near', 'here'], tip: "Bắt đầu từ /ɪ/ rồi trượt về /ə/. Giọng Mỹ thường nghe là /ɪr/." },
  { ipa: 'eɪ', g: 'diph', words: ['day', 'name'], tip: "Bắt đầu 'ê' rồi trượt sang 'i'." },
  { ipa: 'ʊə', g: 'diph', words: ['tour', 'pure'], tip: "Từ /ʊ/ trượt về /ə/. Nhiều người đọc thành /ɔː/." },
  { ipa: 'ɔɪ', g: 'diph', words: ['boy', 'coin'], tip: "Bắt đầu 'o' rồi trượt sang 'i'." },
  { ipa: 'əʊ', g: 'diph', words: ['go', 'home'], tip: "Bắt đầu 'ơ' rồi trượt sang 'u'. Giọng Mỹ ghi là /oʊ/." },
  { ipa: 'eə', g: 'diph', words: ['hair', 'care'], tip: "Bắt đầu 'e' rồi trượt về /ə/. Giọng Mỹ thường nghe là /er/." },
  { ipa: 'aɪ', g: 'diph', words: ['my', 'time'], tip: "Bắt đầu 'a' rồi trượt sang 'i'." },
  { ipa: 'aʊ', g: 'diph', words: ['now', 'house'], tip: "Bắt đầu 'a' rồi trượt sang 'u'." },
  /* Phụ âm */
  { ipa: 'p', g: 'cons', words: ['pen', 'stop'], tip: "Hai môi mím rồi bật hơi. Đầu từ bật hơi mạnh: đưa tay trước miệng phải thấy hơi." },
  { ipa: 'b', g: 'cons', words: ['bad', 'job'], tip: "Giống 'b' tiếng Việt: hai môi mím rồi bật, có rung dây thanh." },
  { ipa: 't', g: 'cons', words: ['tea', 'cat'], tip: "Đầu lưỡi chạm lợi trên rồi bật hơi, mạnh hơn 't' tiếng Việt." },
  { ipa: 'd', g: 'cons', words: ['day', 'bed'], tip: "Đầu lưỡi chạm lợi trên, có rung dây thanh, gần 'đ'." },
  { ipa: 'tʃ', g: 'cons', words: ['chair', 'watch'], tip: "Giống 'ch' nhưng môi hơi chu và bật hơi mạnh hơn." },
  { ipa: 'dʒ', g: 'cons', words: ['job', 'age'], tip: "Như /tʃ/ nhưng có rung dây thanh, môi hơi chu." },
  { ipa: 'k', g: 'cons', words: ['cat', 'back'], tip: "Cuống lưỡi chạm ngạc mềm rồi bật hơi, mạnh hơn 'c/k' tiếng Việt." },
  { ipa: 'ɡ', g: 'cons', words: ['go', 'big'], tip: "Cuống lưỡi chạm ngạc mềm, có rung dây thanh, gần 'g' trong 'gà'." },
  { ipa: 'f', g: 'cons', words: ['fan', 'leaf'], tip: "Răng trên chạm môi dưới và thổi hơi, giống 'ph' tiếng Việt." },
  { ipa: 'v', g: 'cons', words: ['van', 'love'], tip: "Như /f/ nhưng có rung dây thanh. Răng trên chạm môi dưới." },
  { ipa: 'θ', g: 'cons', words: ['think', 'bath'], tip: "Đầu lưỡi đặt giữa hai hàm răng rồi thổi hơi, không rung. Không đọc thành 's' hay 't'." },
  { ipa: 'ð', g: 'cons', words: ['this', 'mother'], tip: "Như /θ/ nhưng có rung dây thanh. Đầu lưỡi nằm giữa hai hàm răng." },
  { ipa: 's', g: 'cons', words: ['sea', 'bus'], tip: "Thổi hơi qua khe giữa lưỡi và răng, không rung dây thanh." },
  { ipa: 'z', g: 'cons', words: ['zoo', 'buzz'], tip: "Như /s/ nhưng có rung dây thanh. Đặt tay lên cổ phải thấy rung." },
  { ipa: 'ʃ', g: 'cons', words: ['she', 'fish'], tip: "Môi chu, lưỡi cong nhẹ, thổi hơi. Giống 'sh', hơi giống 'x' chu môi." },
  { ipa: 'ʒ', g: 'cons', words: ['vision', 'measure'], tip: "Âm hiếm. Như /ʃ/ nhưng có rung dây thanh." },
  { ipa: 'h', g: 'cons', words: ['hat', 'who'], tip: "Thổi hơi nhẹ từ cổ họng, lưỡi không chạm đâu, giống 'h' tiếng Việt." },
  { ipa: 'm', g: 'cons', words: ['man', 'name'], tip: "Hai môi mím, hơi thoát ra đường mũi." },
  { ipa: 'n', g: 'cons', words: ['no', 'sun'], tip: "Đầu lưỡi chạm lợi trên, hơi thoát ra đường mũi." },
  { ipa: 'ŋ', g: 'cons', words: ['sing', 'long'], tip: "Cuống lưỡi chạm ngạc mềm, hơi ra mũi, giống 'ng' cuối từ nhưng không đọc thêm 'g'." },
  { ipa: 'l', g: 'cons', words: ['light', 'ball'], tip: "Đầu lưỡi chạm lợi trên, hơi thoát hai bên lưỡi. Cuối từ vẫn phải chạm lưỡi." },
  { ipa: 'r', g: 'cons', words: ['red', 'run'], tip: "Đầu lưỡi cuộn nhẹ lên nhưng không chạm vòm miệng, môi hơi chu. Không rung lưỡi như 'r' tiếng Việt." },
  { ipa: 'w', g: 'cons', words: ['we', 'wait'], tip: "Môi chu tròn rồi mở nhanh sang nguyên âm sau." },
  { ipa: 'j', g: 'cons', words: ['yes', 'you'], tip: "Nâng lưỡi sát ngạc cứng rồi trượt nhanh, giống 'i' ngắn trước nguyên âm." }
];

GGD.SOUND_GROUPS = [
  { g: 'mono', name: 'Nguyên âm đơn (12)' },
  { g: 'diph', name: 'Nguyên âm đôi (8)' },
  { g: 'cons', name: 'Phụ âm (24)' }
];

/* Cặp từ dễ nhầm để luyện nghe. */
GGD.PAIRS = [
  { a: 'ship', b: 'sheep', note: '/ɪ/ và /iː/' },
  { a: 'live', b: 'leave', note: '/ɪ/ và /iː/' },
  { a: 'full', b: 'fool', note: '/ʊ/ và /uː/' },
  { a: 'pull', b: 'pool', note: '/ʊ/ và /uː/' },
  { a: 'bed', b: 'bad', note: '/e/ và /æ/' },
  { a: 'cat', b: 'cut', note: '/æ/ và /ʌ/' },
  { a: 'think', b: 'sink', note: '/θ/ và /s/' },
  { a: 'three', b: 'free', note: '/θ/ và /f/' },
  { a: 'very', b: 'berry', note: '/v/ và /b/' },
  { a: 'light', b: 'right', note: '/l/ và /r/' },
  { a: 'chair', b: 'share', note: '/tʃ/ và /ʃ/' },
  { a: 'bat', b: 'bet', note: '/æ/ và /e/' }
];
