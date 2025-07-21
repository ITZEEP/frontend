import logoImg from '@/assets/logo.png'

export default {
  logo: logoImg,
  name: '잇집',

  // 메인 메뉴 구성 정보
  owner: [
    {
      title: '직거래 매물',
      url: '/homes',
    },
    {
      title: '사기 위험도 분석',
      url: '/risk-check',
    },
    {
      title: '계약서 작성',
      url: '/contract',
    },
  ],

  // 인증 관련 메뉴 정보
  accountMenus: {
    signin: {
      url: '/auth/signin',
      title: '로그인',
    },
    signup: {
      url: '/auth/signup',
      title: '회원가입',
    },
  },
}
