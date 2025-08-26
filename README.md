<img width="916" height="501" alt="image" src="https://github.com/user-attachments/assets/f92179e2-4d8f-476f-8983-9a3aadce099e" />

간단한 토스트 팝업 라이브러리입니다. 프레임워크 없이 순수 JS/CSS로 동작하며 info, alert, confirm 기능을 제공합니다.

설치/사용

- 포함 파일:
  - `src/toast.css`
  - `src/toast.js`

HTML에 추가:

```html
<link rel="stylesheet" href="src/toast.css" />
<script src="src/toast.js"></script>
```

기본 API

- `Toast.info(message, options)`
- `Toast.alert(message, options)`
- `Toast.confirm(message, onConfirm, onCancel, options)`
- `Toast.setDefaults(options)` 전역 기본값 변경
- `Toast.clear([position])` 모든(또는 특정 위치) 토스트 닫기

옵션 공통값

- `title`: 문자열 제목 (기본: info=“정보”, alert=“알림”, confirm=“확인”)
- `position`: `top-right | top-left | bottom-right | bottom-left | top-center | bottom-center` (기본: `top-right`)
- `duration`: 자동 닫힘 시간(ms). `confirm`은 기본적으로 자동 닫힘 없음
- `duration = 0 | false`: X 버튼을 누를 때까지 유지(정보/알림은 닫기 버튼이 강제로 노출됨)
- `dismissible`: 닫기 버튼 표시 여부 (기본: true, confirm 제외)
- `maxVisible`: 한 위치에 표시 가능한 최대 개수 (기본: 5)
- `ariaLive`: 스크린리더 라이브 영역(`polite`/`assertive`)

confirm 전용 옵션

- `okText` (기본: “확인”)
- `cancelText` (기본: “취소”)
- `onConfirm()`, `onCancel()`는 2,3번째 인자로도 전달 가능

예시

```js
Toast.info('작업이 완료되었습니다.', { duration: 3000 });

Toast.alert('저장에 실패했습니다.', {
  title: '경고',
  position: 'bottom-left',
});

Toast.confirm('삭제하시겠습니까?', () => {
  Toast.info('삭제됨');
}, () => {
  Toast.info('취소됨');
}, {
  position: 'top-center',
  okText: '네',
  cancelText: '아니오',
});

Toast.setDefaults({ position: 'bottom-right', maxVisible: 4 });
```

위치/애니메이션

- 위치는 `top-right | top-left | bottom-right | bottom-left | top-center | bottom-center` 로 지정할 수 있습니다.
- 각 위치에 맞춰 자연스러운 슬라이드 방향(좌/우/상/하)으로 애니메이션됩니다.

데모

- `demo/index.html`에서 바로 동작을 확인할 수 있습니다.

접근성

- `info`: `role=status`, `alert`: `role=alert`, `confirm`: `role=alertdialog`
- `confirm` 토스트는 표시 시 포커스를 받으며 Enter=확인, Esc=취소를 지원합니다.

라이선스

- 이 저장소에 별도 라이선스가 없다면 사내/개인 프로젝트 용으로 자유롭게 사용하세요.
