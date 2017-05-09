angular.module('App')
// 커뮤니티 탭 컨트롤러
  .controller("CommunityTabsCtrl", function ($rootScope, $scope) {
    console.log("커뮤니티탭");
  })

  // 커뮤니티 메인 리스트 컨트롤러
  .controller("CommunityMainCtrl", function ($rootScope, $scope, $stateParams, $http, $ionicModal, $ionicLoading, MyConfig, MyPopup, ValChkService) {

    // TODO: 검색기능
    $scope.search = function () {
      MyPopup.alert("검색", "검색")
    }

    // TODO: 글 작성폼 에서 그림 추가
    $scope.addPicture = function () {
      MyPopup.alert("그림", "그림")
    };

    // 좋아요
    $scope.likeBoard = function (targetType, boardNo, index) {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/like",
        method: "POST",
        data: $.param({
          targetNo: boardNo,
          targetType: targetType,
          userUid: $rootScope.rootUser.userUid
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        if (response == true) {
          $scope.boardList[index].likeCnt--;
        } else {
          $scope.boardList[index].likeCnt++;
        }
      }).error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      }).finally(function () {
        $ionicLoading.hide();
        $scope.closeModal();
      })
    };

    // 게시판 리스트 불러오기
    $scope.getBoardList = function () {
      $scope.page++;
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });

      // 카테고리가 있는지 없는지 판단
      if ($stateParams.categoryNo) {
        var url = MyConfig.backEndURL + "/community/select/boardByCategory?page=" + $scope.page + "&count=" + $scope.count + "&categoryNo=" + $stateParams.categoryNo;
      } else {
        // var url = MyConfig.backEndURL + "/community/select/board?page=" + $scope.page + "&count=" + $scope.count;
        var url = "http://192.168.0.187:8081/app/community/board?page=" + $scope.page + "&count=" + $scope.count;
      }

      $http({
        url: url,
        method: "GET"
      }).success(function (response) {
        angular.forEach(response.boardList, function (board) {
          if (board.targetType != '2') {
            board.targetType = '1'
          }
          $scope.boardList.push(board);
        });
        $scope.total = response.totalPages;
        console.log($scope.boardList);
      })
        .error(function (error) {
          MyPopup.alert("에러", "서버접속불가");
        })
        .finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    }

    // 글쓰기
    $scope.write = function (writeData) {
      if (ValChkService.validationCheck("null", writeData.categoryNo)) { return false;}
      if (ValChkService.validationCheck("null", writeData.title)) { return false;}
      if (ValChkService.validationCheck("null", writeData.content)) { return false;}

      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/insert/board",
        method: "POST",
        data: $.param({
          categoryNo: writeData.categoryNo,
          title: writeData.title,
          userUid: $rootScope.rootUser.userUid,
          content: writeData.content
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        MyPopup.alert("성공", "글이 등록되었습니다.");
      }).error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      }).finally(function () {
        $ionicLoading.hide();
        $scope.load();
        $scope.closeModal();
      })
    }

    // 글쓰기 폼 리셋
    $scope.resetModal = function () {
      $scope.writeBoard = {
        categoryNo: 0,
        title: "",
        content: ""
      }
    }

    // 위로 당겼을 때 페이징 초기화 및 새로고침
    $scope.load = function () {
      $scope.count = 10;
      $scope.page = 0;
      $scope.total = 1;
      $scope.boardList = [];
      $scope.getBoardList();
    }

    // 모달
    $ionicModal.fromTemplateUrl('community/writeFormModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function (categoryNo) {
      $scope.writeBoard = {
        categoryNo: categoryNo
      }
      // 카테고리 리스트 가져오기
      $http({
        url: MyConfig.backEndURL + "/community/select/category",
        method: "GET"
      })
        .success(function (response) {
          $scope.categories = response;
          $scope.modal.show();
        })
        .error(function (err) {
          console.log(err);
        })
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
    $scope.$on('modal.hidden', function () {
      $scope.resetModal();
    });
    $scope.$on('modal.removed', function () {
    });

    // 페이지 로딩 시 식당 첫 페이지 데이터 불러오기
    $scope.load();

  })

  // 디테일 컨트롤러
  .controller("CommunityDetailCtrl", function ($rootScope, $scope, $stateParams, $state, $ionicHistory, $ionicLoading, $http, $ionicActionSheet, MyConfig, MyPopup, $timeout, $ionicModal, ValChkService) {

    // 뒤로가기 버튼 강제 활성화
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });

    // 게시글 수정
    $scope.update = function (updateData) {
      if (ValChkService.validationCheck("null", updateData.categoryNo)) { return false;}
      if (ValChkService.validationCheck("null", updateData.title)) { return false;}
      if (ValChkService.validationCheck("null", updateData.content)) { return false;}

      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/update/oneBoard",
        data: $.param({
          categoryNo: updateData.categoryNo,
          title: updateData.title,
          userUid: $rootScope.rootUser.userUid,
          content: updateData.content
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        MyPopup.alert('알림', '게시글 수정이 완료 되었습니다.');
      }).error(function (error) {
        console.log(error);
      }).finally(function () {
        $ionicLoading.hide();
        // 페이지 이동
        $state.go('community.main');
      })
    };

    // 게시글 삭제
    $scope.deleteBoard = function () {
      MyPopup.confirm('삭제확인', '정말로 삭제하시겠습니까?', function () {
        $ionicLoading.show({
          template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
        });
        $http({
          url: MyConfig.backEndURL + "/community/delete/oneBoard?boardNo=" + $stateParams.boardNo,
          method: "DELETE",
        }).success(function (response) {
          MyPopup.alert('알림', '게시글이 삭제되었습니다.');
        }).error(function (error) {
          console.log(error);
        }).finally(function () {
          $ionicLoading.hide();
          // 페이지 이동
          $scope.load();
          $state.go('community.main');
        })
      }, function () {
        // 삭제 취소
      })
    }

    // 게시글 불러오기
    $scope.getBoard = function () {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });

      if ($stateParams.targetType == '1') {
        $http({
          url: MyConfig.backEndURL + "/community/select/oneBoard?boardNo=" + $stateParams.boardNo,
          method: "GET",
        }).success(function (response) {
          $scope.board = response;
        })
          .error(function (error) {
            MyPopup.alert("에러", "서버접속불가");
          })
          .finally(function () {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
      } else if ($stateParams.targetType == '2') {
        $http({
          url: "http://192.168.0.187:8081/app/community/oneBoard?boardNo=" + $stateParams.boardNo,
          method: "GET",
        }).success(function (response) {
          $scope.board = response;
          console.log($scope.board);
        })
          .error(function (error) {
            MyPopup.alert("에러", "서버접속불가");
          })
          .finally(function () {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
      }
    }

    // 액션 시트 (게시글)
    $scope.showActionSheet = function () {
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: '게시글 수정'},
          {text: '게시글 삭제'}
        ],
        cancelText: '취소',
        cancel: function () {

        },
        buttonClicked: function (index) {
          hideSheet();
          if (index == 0) {
            // 게시글 수정
            $scope.openModal();
          } else if (index == 1) {
            $scope.deleteBoard();
          }
          return index;
        }
      });
      $timeout(function () {
        hideSheet();
      }, 5000);
    };

    // 모달
    $ionicModal.fromTemplateUrl('community/updateFormModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // 모달 동작
    $scope.openModal = function () {
      $scope.updateBoard = {
        categoryNo: $scope.board.categoryNo,
        title: $scope.board.title,
        content: $scope.board.content,
        regDate: $scope.board.regDate,
        userUid: $scope.board.userUid,
        displayName: $scope.board.displayName
      }
      // 카테고리 리스트 가져오기
      $http({
        url: MyConfig.backEndURL + "/community/select/category",
        method: "GET"
      })
        .success(function (response) {
          $scope.categories = response;
          $scope.modal.show();
        })
        .error(function (err) {
          console.log(err);
        })
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
    $scope.$on('modal.hidden', function () {
      $scope.resetModal();
    });
    $scope.$on('modal.removed', function () {
    });

    // 글수정 폼 리셋
    $scope.resetModal = function () {
      $scope.updateBoard = {
        categoryNo: $scope.board.categoryNo,
        title: $scope.board.title,
        content: $scope.board.content,
        regDate: $scope.board.regDate,
        userUid: $scope.board.userUid,
        displayName: $scope.board.displayName
      }
    }

    // 액션 시트(코멘트)
    $scope.showCommentActionSheet = function (userUid, commentNo, displayName, commentContent) {
      // Show the action sheet
      if (userUid == $rootScope.rootUser.userUid) {
        var buttons = [
          {text: displayName + '에게 댓글 작성'},
          {text: '댓글 수정'},
          {text: '댓글 삭제'}
        ];
      } else {
        var buttons = [
          {text: displayName + '에게 댓글 작성'},
        ];
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: buttons,
        cancelText: '취소',
        cancel: function () {

        },
        buttonClicked: function (index) {
          hideSheet();
          if (index == 0) {
            // 커멘트 수정
            $scope.writeSubComment(commentNo, displayName);
          } else if (index == 1) {
            $scope.updateComment(commentNo, commentContent);
          } else if (index == 2) {
            $scope.deleteComment(commentNo);
          }
          return index;
        }
      });
      $timeout(function () {
        hideSheet();
      }, 5000);
    };

    // 위로 당겼을 때 페이징 초기화 및 새로고침
    $scope.load = function () {
      $scope.page = 0;
      $scope.total = 1;
      $scope.commentList = [];
      $scope.getBoard();
      $scope.getCommentList();
      $scope.targetCommentNo = null;
      $scope.isBookmarkStatus();
    }

    // 댓글 조회
    $scope.getCommentList = function () {
      $scope.page++;
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/select/comment?page=" + $scope.page + "&boardNo=" + $stateParams.boardNo,
        method: "GET"
      }).success(function (response) {
        angular.forEach(response.commentList, function (comment) {
          $scope.commentList.push(comment);
        })
        $scope.total = response.totalPages;
      })
        .error(function (error) {
          MyPopup.alert("에러", "서버접속불가");
        })
        .finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    // 대댓글 작성
    $scope.writeSubComment = function(targetCommentNo, displayName) {
      $scope.targetCommentNo = targetCommentNo;
      $scope.comment = {
        commentContent: displayName + "에게 : "
      };
    }

    // 댓글 작성
    $scope.writeComment = function () {
      // 댓글 유효성 체크
      if(!ValChkService.validationCheck("null", $scope.comment.commentContent)) { return false;}

      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/insert/comment",
        method: "POST",
        data: $.param({
          targetCommentNo: $scope.targetCommentNo,
          boardNo: $stateParams.boardNo,
          userUid: $rootScope.rootUser.userUid,
          content: $scope.comment.commentContent
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        MyPopup.alert("성공", "댓글이 등록되었습니다.");
      }).error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      }).finally(function () {
        $ionicLoading.hide();
        $scope.load();
        $scope.comment = {
          commentContent: ""
        };
      })
    };

    // 댓글 삭제
    $scope.deleteComment = function (commentNo) {
      MyPopup.confirm('삭제확인', '정말로 삭제하시겠습니까?', function () {
        $ionicLoading.show({
          template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
        });
        $http({
          url: MyConfig.backEndURL + "/community/delete/oneComment?commentNo=" + commentNo,
          method: "DELETE"
        }).success(function (response) {
          MyPopup.alert('알림', '댓글이 삭제되었습니다.');
        }).error(function (error) {
          console.log(error);
        }).finally(function () {
          $ionicLoading.hide();
          $scope.load();
        })
      }, function () {
      })
    };

    // 댓글 수정
    $scope.updateComment = function (commentNo, commentContent) {
      MyPopup.prompt('댓글', '수정할 댓글을 입력해 주세요', function (result) {
        // 댓글 유효성 체크
        if (!ValChkService.validationCheck("null", result)) {return false;}

        $ionicLoading.show({
          template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
        });
        $http({
          url: MyConfig.backEndURL + "/community/update/oneComment",
          method: "POST",
          data: $.param({
            commentNo: commentNo,
            content: result
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
          }
        }).success(function (response) {
          MyPopup.alert('알림', '댓글이 수정되었습니다.');
        }).error(function (error) {
          console.log(error);
        }).finally(function () {
          $ionicLoading.hide();
          $scope.load();
        })
      }, commentContent)
    };

    // 좋아요
    $scope.likeBoard = function (targetType) {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/like",
        method: "POST",
        data: $.param({
          targetNo: $stateParams.boardNo,
          targetType: targetType,
          userUid: $rootScope.rootUser.userUid
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        if (response == true) {
        } else {
        }
      }).error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      }).finally(function () {
        $ionicLoading.hide();
        $scope.load();
      })
    };

    // 북마크 여부 조회
    $scope.isBookmarkStatus = function () {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/select/bookMark?targetNo=" + $stateParams.boardNo + "&userUid="+ $rootScope.rootUser.userUid + "&targetType=" + $stateParams.targetType,
        method: "GET"
      })
        .success(function (response) {
          $scope.bookMark = response;
        })
        .error(function (err) {
          console.log(err);
        })
        .finally(function () {

        })
    }

    // 북마크 추가 삭제
    $scope.addBookMark = function (targetType) {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });
      $http({
        url: MyConfig.backEndURL + "/community/bookMark",
        method: "POST",
        data: $.param({
          targetNo: $stateParams.boardNo,
          targetType: targetType,
          userUid: $rootScope.rootUser.userUid
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      }).success(function (response) {
        $scope.bookMark = response;
        if (response == true) {
          MyPopup.alert("알림", "게시글이 북마크에서 삭제 되었습니다.");
        } else {
          MyPopup.alert("알림", "게시글이 북마크에 등록 되었습니다.");
        }
      }).error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      }).finally(function () {
        $ionicLoading.hide();
        $scope.load();
      })
    };

    // TODO: 댓글 입력 창에 포커스 주기(안됨)
    $scope.focusCommentBox = function () {
      $("#commentInputBox").focus();
    }

    // TODO: 소셜에 공유하기
    $scope.share = function () {
      MyPopup.alert("TODO", "공유기능 해야함");
    };

    // 페이지 초기화
    $scope.load();

  })
