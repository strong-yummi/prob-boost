# 🐱 냥냥 확률 업

고양이가 지켜보는 **확률 부스팅** 웹사이트입니다.  
입력한 성공 확률을 바탕으로 실패를 쌓아 성공 확률을 **80%까지 끌어올리고**, 마지막에는 **실제 CPU 연산(SHA-256 Proof of Work)** 으로 성공을 확정합니다.

> 🌐 라이브 사이트: https://strong-yummi.github.io/prob-boost/

---

## ✨ 주요 기능

- 📈 **확률 업**: 입력한 성공 확률(%)을 시작점으로, 실패를 누적하며 성공 확률을 80%까지 끌어올립니다.
- 🔥 **실제 CPU 연산**: 80%에 도달하면 SHA-256 Proof of Work를 수행해 해시가 `00000`으로 시작하는 값을 찾을 때까지 CPU가 실제로 연산합니다.
- 📊 **실시간 값 표시**: 확률 값, 시도 횟수, 현재 해시, 진행률을 실시간으로 보여줍니다.
- 📜 **실행 기록**: 과거 실행(시드 확률, 시도 횟수, 5연속 성공 확률, nonce)을 localStorage에 저장하고 조회/삭제할 수 있습니다.
- 🐾 **고양이 테마**: 떠다니는 발자국 배경, 고양이 마스코트, 분홍/라벤더 그라데이션 UI.

## 🎮 사용 방법

1. 사이트에 접속합니다.
2. **성공 확률(%)** 을 입력합니다 (기본 50%).
3. **실행 🐾** 버튼을 누릅니다.
4. 확률 값이 0% → … → 80%로 올라가는 과정과 CPU 연산 횟수/해시를 실시간으로 확인합니다.
5. 연산이 완료되면 초록(성공) 결과와 `nonce` / `hash`가 표시됩니다.

## 🧮 동작 원리

```
입력 확률 p (예: 50%)
   ↓
실패 누적 → 성공 확률 상승 (prob = min(80, prob + (80 - prob) * 0.22 + 0.5))
   ↓
확률 80% 도달
   ↓
SHA-256 Proof of Work (해시가 00000으로 시작할 때까지 연산)
   ↓
성공 확정 🎉
```

- 5연속 성공 확률은 `p^5 × 100` 으로 자동 계산되어 표시됩니다 (예: 50% → 3.1%).

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Computation**: Web Crypto API (SHA-256), `crypto.subtle.digest`
- **Storage**: `localStorage` (실행 기록)
- **Hosting**: GitHub Pages
- (선택) **Local server**: Node.js 정적 파일 서버 (`server.js`)

## 🚀 로컬 실행

```bash
# 정적 파일 서버로 실행 (선택)
cd prob-boost
node server.js
# http://localhost:3000 접속
```

또는 `index.html`을 브라우저에서 직접 열어도 동작합니다.

## 📁 파일 구조

```
prob-boost/
├── index.html      # 메인 페이지 (확률 업 + CPU 연산)
├── history.html    # 실행 기록 페이지
├── styles.css      # 고양이 테마 스타일
├── app.js          # 확률 계산 / PoW / 기록 로직
└── server.js       # (선택) Node 정적 서버
```

## 📝 라이선스

MIT License

---

Made with 🐾 by [strong-yummi](https://github.com/strong-yummi)
