// 로그인 컨트롤러
app.controller('SigninCtrl', function ($scope, AuthService, ValChkService, MyPopup) {
  $scope.loginWithEmail = function (useremail, password, redirectTo) {
    // 유효성 검사
    if (!ValChkService.validationCheck("email", useremail)) {return false;}
    if (!ValChkService.validationCheck("password", password)) {return false;}
    AuthService.loginWithEmail(useremail, password, redirectTo);
  }

  $scope.loginWithPortal = AuthService.loginWithSocial;
})

// 회원가입 컨트롤러
  .controller('SignupCtrl', function ($scope, AuthService) {
    $scope.register =function (displayname, useremail, password, redirectTo) {
      // 유효성 검사
      if (!ValChkService.validationCheck("displayName", displayname)) {return false;}
      if (!ValChkService.validationCheck("email", useremail)) {return false;}
      if (!ValChkService.validationCheck("password", password)) {return false;}
      AuthService.register(displayname, useremail, password, redirectTo);
    }
  })

// 비밀번호 초기화 컨트롤러
.controller('ResetPasswordCtrl', function ($scope, AuthService) {
  $scope.resetPassword = function (useremail) {
    if (!ValChkService.validationCheck("email", useremail)) {return false;}
    AuthService.resetPassword(useremail);
  }
})

// 로그인 메인 컨트롤러
  .controller('LoginMainCtrl', function ($scope, AuthService) {

  })
;
