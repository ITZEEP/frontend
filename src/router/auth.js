export default [
  {
    path: '/auth/signin',
    name: 'signin',
    component: () => import('../pages/auth/SigninPage.vue'),
  },
  {
    path: '/auth/signup',
    name: 'signup',
    component: () => import('../pages/auth/SignupPage.vue'),
  },
  {
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: () => import('../pages/auth/OAuthCallback.vue'),
  },
  {
    path: '/oauth/callback/:provider',
    name: 'oauth-callback-provider',
    component: () => import('../pages/auth/OAuthCallback.vue'),
  },
]
