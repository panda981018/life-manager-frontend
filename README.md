# Life Manager Frontend 🎨

Life Manager의 React 기반 프론트엔드 애플리케이션

## 📋 프로젝트 소개

직관적인 UI/UX로 일정과 지출을 관리할 수 있는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 🎨 UI/UX
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- Tailwind CSS 기반 모던한 디자인
- 로딩 상태 및 에러 처리
- Toast 알림 시스템

### 🔐 인증
- 이메일/비밀번호 로그인
- 소셜 로그인 (Google, Kakao, Naver)
- JWT 토큰 기반 인증
- 자동 로그아웃 (401 에러 시)

### 📊 페이지
- **대시보드**: 요약 통계 및 최근 활동
- **일정 관리**: 일정 CRUD 및 캘린더 뷰
- **지출 관리**: 거래 내역 및 통계
- **프로필**: 사용자 정보 수정

## 🛠 기술 스택

- React 18.3.1
- React Router DOM 7.1.1
- Axios 1.7.9
- Tailwind CSS 3.4.17
- Vercel (배포)

## 🚀 시작하기

### 환경 변수 설정

`.env` 파일 생성:
```env
REACT_APP_API_URL=http://localhost:9000/api
REACT_APP_BACKEND_URL=http://localhost:9000
```

### 로컬 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 애플리케이션이 http://localhost:3000 에서 실행됩니다
```

### 프로덕션 빌드
```bash
# 빌드
npm run build

# 빌드 결과: build/ 폴더
```

## 📁 프로젝트 구조
```
src/
├── assets/              # 이미지, 아이콘
├── components/          # 재사용 가능한 컴포넌트
│   ├── Loading.js
│   ├── Toast.js
│   └── Navbar.js
├── contexts/            # React Context (AuthContext)
├── hooks/               # 커스텀 훅
│   ├── useAuth.js
│   └── useForm.js
├── pages/               # 페이지 컴포넌트
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── SchedulesPage.js
│   ├── TransactionsPage.js
│   ├── ProfilePage.js
│   └── OAuth2RedirectPage.js
├── services/            # API 서비스
│   └── api.js
├── App.js               # 메인 앱 컴포넌트
└── index.js             # 엔트리 포인트
```

## 🔑 OAuth2 설정

프론트엔드는 백엔드 OAuth2 엔드포인트로 리다이렉트만 수행합니다.

### 소셜 로그인 플로우
```
1. 사용자가 소셜 로그인 버튼 클릭
   ↓
2. 백엔드 OAuth2 엔드포인트로 리다이렉트
   (예: /api/oauth2/authorization/google)
   ↓
3. OAuth2 제공자 로그인 페이지
   ↓
4. 백엔드가 인증 처리 및 JWT 생성
   ↓
5. /api/oauth2/redirect?token=...&userId=...&name=... 로 리다이렉트
   ↓
6. 토큰 저장 후 대시보드로 이동
```

## 🌐 배포 (Vercel)

### 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### 자동 배포

- `main` 브랜치에 푸시하면 자동 배포
- PR 생성 시 Preview 배포

## 📝 커스텀 훅

### useAuth
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

### useForm
```javascript
const { values, handleChange, resetForm, setValues } = useForm({
  email: '',
  password: ''
});
```

## 🎨 디자인 시스템

### 색상

- Primary: Blue (#3B82F6)
- Secondary: Purple (#9333EA)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Yellow (#F59E0B)

### 컴포넌트

- 버튼: 3가지 변형 (primary, secondary, outline)
- 입력 필드: 포커스 링 효과
- 카드: 그림자 및 라운드 코너
- 로딩: 중앙 오버레이 스피너

## 🤝 기여

백엔드 저장소와 동일한 기여 가이드라인을 따릅니다.

## 📄 라이선스

MIT License

---

⭐ 도움이 되셨다면 Star를 눌러주세요!