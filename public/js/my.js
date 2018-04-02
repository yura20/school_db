const app = angular.module('app', ['ngRoute', 'ngDialog']);

//Забираєм %2F та # з url сайту
app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(true);
}]);

//Створюєм адреси
app.config(function($routeProvider) {
  $routeProvider
    .otherwise({
      redirectTo: '/'
    });
});

//Контроллер
app.controller("MyCtrl", function($scope, $http, ngDialog) {});
var T = '';
const link = 'http://localhost:8000';
app.directive('loginBlock', function() {
  return {
    templateUrl: 'template/login.html',
    controller: function($scope, $http, ngDialog) {
      //Авторизація за допомогою localstorage
      var cKey = localStorage.getItem('key');
      var cId = localStorage.getItem('id');
      if (cKey != undefined && cId != undefined) {
        $http.get(link + '/login-cookie' + cKey + '-' + cId)
          .then(function successCallback(response) {
            if (response.data != "" && response.data != undefined) {
              T = response.data['key'];
              alert('Hello, ' + response.data.login);
              $('.log').css('display', 'none');
              $('.logout').css('display', 'block');
            }
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
      } else {
        $('.log').css('display', 'block');
      }
      //Авторизація
      $scope.check = function() {
        let loginObj = {
          login: $scope.login,
          pass: $scope.password
        };
        $http.post(link + '/login-auth', loginObj)
          .then(function successCallback(response) {
            if (response.data["welcome"] == "welcome") {
              alert("Welcome!");
              T = response.data["key"];
              $('.log').css('display', 'none');
              $('.logout').css('display', 'block');
              localStorage.setItem('key', response.data["key"]);
              localStorage.setItem('id', response.data["id"]);
              $scope.login = "";
              $scope.password = "";
            } else {
              $scope.user = response.data;
            };
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
      };
      //logout
      $scope.logout = function() {
        T = '';
        localStorage.removeItem("key");
        localStorage.removeItem("id");
        $('.log').css('display', 'block');
        $('.logout').css('display', 'none');
      }
    }
  }
});
//Директива Меню
app.directive('naviBlock', function() {
  return {
    replace: true,
    templateUrl: 'template/navi-menu.html',
    controller: function($scope, $http, ngDialog) {
      //Сторінки
      $scope.teachersStatus = false;
      $scope.classroomStatus = false;
      $scope.pupilsStatus = false;
      $scope.searchStatus = false;
      //Показати вчителів
      $scope.teachersStart = function() {
        $http.get('http://localhost:8000/column-for-teachers')
          .then(function successCallback(response) {
            $scope.columnForTeachers = response.data;
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
        $http.get('http://localhost:8000/teachers')
          .then(function successCallback(response) {
            $scope.teachers = response.data;
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
        $scope.teachersStatus = true;
        $scope.classroomStatus = false;
        $scope.pupilsStatus = false;
        $scope.searchStatus = false;
      }
      //Приховати вчителів
      $scope.closeTeachers = function() {
        $scope.teachersStatus = false;
      }
      //Показати класи
      $scope.classroomStart = function() {
        $http.get('http://localhost:8000/classroom')
          .then(function successCallback(response) {
            $scope.classroom2 = response.data;
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
        $scope.classroomStatus = true;
        $scope.teachersStatus = false;
        $scope.pupilsStatus = false;
        $scope.searchStatus = false;
      }
      //Приховати класи
      $scope.closeClassroom = function() {
        $scope.classroomStatus = false;
      }
      //Показати учнів
      $scope.pupilsStart = function() {
        $http.get('http://localhost:8000/pupils')
          .then(function successCallback(response) {
            $scope.allpupils = response.data;
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
        $scope.pupilsStatus = true;
        $scope.teachersStatus = false;
        $scope.classroomStatus = false;
        $scope.searchStatus = false;
      }
      //Приховати учнів
      $scope.searchPupil = function() {
        $scope.searchStatus = false;
      }
      //Показати пошук учнів
      $scope.searchPupil = function() {
        $scope.searchStatus = true;
        $scope.teachersStatus = false;
        $scope.classroomStatus = false;
        $scope.pupilsStatus = false;
      }
      //Приховати пошук учнів
      $scope.closeSearch = function() {
        $scope.searchStatus = false;
      }
    }
  }
});
app.directive('searchBlock', function() {
  return {
    replace: true,
    templateUrl: 'template/search.html',
    controller: function($scope, $http, ngDialog) {
      //знайти учня за іменем
      $scope.searchLol = function() {
        if ($scope.searchName != '') {
          let searchObj = {
            name: $scope.searchName
          }
          $http.post(link + '/search-pupil', searchObj)
            .then(function successCallback(response) {
              $scope.pupilsB = response.data;
              $scope.searchName = "";
            }, function errorCallback(response) {
              console.log('error', response.err)
            });
        }
      }
    }
  }
});


//Директива Вчителі
app.directive('teachersBlock', function() {
  return {
    replace: true,
    templateUrl: 'template/teachers-dir.html',
    controller: function($scope, $http, ngDialog) {
      //видалити вчителя
      $scope.deleteTeacher = function(index) {
        if (T != '' && T == localStorage.getItem('key')) {
          let teacherObj = {
            id: index
          }
          $http.post('http://localhost:8000/del-teacher', teacherObj)
            .then(function successCallback(response) {
              $http.get('http://localhost:8000/teachers')
                .then(function successCallback(response) {
                  $scope.teachers = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            }, function errorCallback(response) {
              console.log('error', response.err)
            });
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми редагування вчителя
      $scope.editTeacher = function(index) {
        if (T != '' && T == localStorage.getItem('key')) {
          ngDialog.open({
              template: '/template/editTeach.html',
              scope: $scope,
              controller: function($scope) {
                var editData = {};
                $http.get('http://localhost:8000/teachers')
                  .then(function successCallback(response) {
                    $scope.teachers = response.data;
                    $scope.indexOfTeacher = index;
                    for (var k in $scope.teachers[index]) {
                      editData[k] = $scope.teachers[index][k];
                      if (k != 'id') {
                        $('.editDiv').append(k + '<br><input type="text" value="' + $scope.teachers[index][k] + '" class="edit' + k + '"><br>');
                      }
                    }
                  }, function errorCallback(response) {
                    console.log("Error!!!" + response.err);
                  });
                //редагувати вчителя
                $scope.editTeach = function() {
                  for (var key in editData) {
                    if (key != 'id') {
                      editData[key] = $('.edit' + key).val()
                    }
                  }
                  $http.post('http://localhost:8000/edit-teach', editData)
                    .then(function successCallback(response) {
                      ngDialog.closeAll();
                    }, function errorCallback(response) {
                      console.log('error', response.err)
                    });
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/teachers')
                .then(function successCallback(response) {
                  $scope.teachers = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми додавання вчителя
      $scope.addTeachers = function() {
        if (T != '' && T == localStorage.getItem('key')) {
          ngDialog.open({
              template: '/template/addTeachers.html',
              scope: $scope,
              controller: function($scope) {
                $scope.nameTeacher = '';
                $scope.snameTeacher = '';
                // додати вчителя
                $scope.addteach = function() {
                  let teacherObj = {
                    name: $scope.nameTeacher,
                    sname: $scope.snameTeacher
                  };
                  $http.post('http://localhost:8000/add-teach', teacherObj)
                    .then(function successCallback(response) {
                      ngDialog.closeAll();
                      $scope.nameTeacher = '';
                      $scope.snameTeacher = '';
                    }, function errorCallback(response) {
                      console.log('error', response.err)
                    });
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/teachers')
                .then(function successCallback(response) {
                  $scope.teachers = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми додавання стовпця
      $scope.addColumn = function() {
        if (T != '' && T == localStorage.getItem('key')) {
          ngDialog.open({
              template: '/template/addColumn.html',
              scope: $scope,
              controller: function($scope) {
                //додати стовпець
                $scope.addC = function() {
                  var cObj = {
                    name: $scope.columnNameForThead,
                    key: $scope.columnName
                  }
                  var columnObj = {
                    name: $scope.columnName
                  }
                  $http.post('http://localhost:8000/add-column-for-teachers', cObj)
                    .then(function successCallback(response) {
                      $http.post('http://localhost:8000/add-column', columnObj)
                        .then(function successCallback(response) {
                          ngDialog.closeAll();
                        }, function errorCallback(response) {
                          console.log('error', response.err)
                        });
                    }, function errorCallback(response) {
                      console.log('error', response.err)
                    });
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/column-for-teachers')
                .then(function successCallback(response) {
                  $scope.columnForTeachers = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
              $http.get('http://localhost:8000/teachers')
                .then(function successCallback(response) {
                  $scope.teachers = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
    }
  }
});


//Директива Класи
app.directive('classroomBlock', function() {
  return {
    replace: true,
    templateUrl: 'template/classroom.html',
    controller: function($scope, $http, ngDialog) {
      //видалити клас
      $scope.deleteClassroom = function(index) {
        if (T != '' && T == localStorage.getItem('key')) {
          let classObj = {
            id: index
          }
          $http.post('http://localhost:8000/del-class', classObj)
            .then(function successCallback(response) {
              $http.get('http://localhost:8000/classroom')
                .then(function successCallback(response) {
                  $scope.classroom2 = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            }, function errorCallback(response) {
              console.log('error', response.err)
            });
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }

      //Виклик форми редагування класу
      $scope.editClassroom = function(index, name) {
        if (T != '' && T == localStorage.getItem('key')) {
          $http.get('http://localhost:8000/teachers')
            .then(function successCallback(response) {
              $scope.teachers = response.data;
            }, function errorCallback(response) {
              console.log("Error!!!" + response.err);
            });
          ngDialog.open({
              template: '/template/editClass.html',
              scope: $scope,
              controller: function($scope) {
                $scope.indexOfClass = index;
                $scope.editNameClass = name;
                //редагування класу
                $scope.editClass = function() {
                  var form8 = document.forms.form8;
                  for (var i = 0; i < form8.select_list.options.length; i++) {
                    if (form8.select_list.options[i].selected) {
                      var ListT = form8.select_list.options[i].value;
                    }
                  }
                  let classObj = {
                    id: $scope.indexOfClass,
                    name: $scope.editNameClass,
                    teachers_id: ListT
                  };
                  if (ListT != 0) {
                    $http.post('http://localhost:8000/edit-class', classObj)
                      .then(function successCallback(response) {
                        ngDialog.closeAll();
                      }, function errorCallback(response) {
                        console.log('error', response.err)
                      });
                  }
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/classroom')
                .then(function successCallback(response) {
                  $scope.classroom2 = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми додавання класу
      $scope.addClass = function() {
        if (T != '' && T == localStorage.getItem('key')) {
          $http.get('http://localhost:8000/teachers')
            .then(function successCallback(response) {
              $scope.teachers = response.data;
            }, function errorCallback(response) {
              console.log("Error!!!" + response.err);
            });
          ngDialog.open({
              template: '/template/addClass.html',
              scope: $scope,
              controller: function($scope) {
                //додати клас
                $scope.addclass = function() {
                  var form7 = document.forms.form7;
                  for (var i = 0; i < form7.select_list.options.length; i++) {
                    if (form7.select_list.options[i].selected) {
                      var ListT = form7.select_list.options[i].value;
                    }
                  }
                  let classObj = {
                    name: $scope.nameClass,
                    teachers_id: ListT
                  };
                  if (ListT != 0) {
                    $http.post('http://localhost:8000/add-class', classObj)
                      .then(function successCallback(response) {
                        ngDialog.closeAll();
                      }, function errorCallback(response) {
                        console.log('error', response.err)
                      });
                  }
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/classroom')
                .then(function successCallback(response) {
                  $scope.classroom2 = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //перейти до учнів класу
      $scope.gotoClassroom = function(index, id_t) {
        $http.get('http://localhost:8000/pupils' + index)
          .then(function successCallback(response) {
            $scope.pupils = response.data;
          }, function errorCallback(response) {
            console.log("Error!!!" + response.err);
          });
        $scope.p_id = index;
        ngDialog.open({
          template: '/template/showPupils.html',
          scope: $scope,
          controller: function($scope) {}
        })

      }
    }
  }
});

app.directive('pupilsBlock', function() {
  return {
    replace: true,
    templateUrl: 'template/pupils.html',
    controller: function($scope, $http, ngDialog) {
      //видалити учня
      $scope.deletePupil = function(index) {
        if (T != '' && T == localStorage.getItem('key')) {
          let pupilObj = {
            id: index
          }
          $http.post('http://localhost:8000/del-pupil', pupilObj)
            .then(function successCallback(response) {
              $http.get('http://localhost:8000/pupils')
                .then(function successCallback(response) {
                  $scope.allpupils = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            }, function errorCallback(response) {
              console.log('error', response.err)
            });
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми редагування учня
      $scope.editPupil = function(index, name, sname) {
        if (T != '' && T == localStorage.getItem('key')) {
          $http.get('http://localhost:8000/classroom2')
            .then(function successCallback(response) {
              $scope.classroom = response.data;
            }, function errorCallback(response) {
              console.log("Error!!!" + response.err);
            });
          ngDialog.open({
              template: '/template/editPupil.html',
              scope: $scope,
              controller: function($scope) {
                $scope.indexOfPupil = index;
                $scope.editNamePupil = name;
                $scope.editSnamePupil = sname;
                //Редагування учня
                $scope.editPupilp = function() {
                  var form9 = document.forms.form9;
                  for (var i = 0; i < form9.select_list.options.length; i++) {
                    if (form9.select_list.options[i].selected) {
                      var ListT = form9.select_list.options[i].value;
                    }
                  }
                  let pupilObj = {
                    id: $scope.indexOfPupil,
                    name: $scope.editNamePupil,
                    sname: $scope.editSnamePupil,
                    classroom_id: ListT
                  };
                  if (ListT != 0) {
                    $http.post('http://localhost:8000/edit-pupil', pupilObj)
                      .then(function successCallback(response) {
                        ngDialog.closeAll();
                      }, function errorCallback(response) {
                        console.log('error', response.err)
                      });
                  }
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/pupils')
                .then(function successCallback(response) {
                  $scope.allpupils = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
      //Виклик форми додавання учня
      $scope.addNewP = function() {
        if (T != '' && T == localStorage.getItem('key')) {
          $http.get('http://localhost:8000/classroom2')
            .then(function successCallback(response) {
              $scope.classroom = response.data;
            }, function errorCallback(response) {
              console.log("Error!!!" + response.err);
            });
          ngDialog.open({
              template: '/template/addPupil.html',
              scope: $scope,
              controller: function($scope) {
                //Додати учня
                $scope.addPupil = function() {
                  var form10 = document.forms.form10;
                  for (var i = 0; i < form10.select_list.options.length; i++) {
                    if (form10.select_list.options[i].selected) {
                      var ListT = form10.select_list.options[i].value;
                    }
                  }
                  let pupilObj = {
                    name: $scope.namePupil,
                    sname: $scope.snamePupil,
                    classroom_id: ListT
                  };
                  if (ListT != 0) {
                    $http.post('http://localhost:8000/add-pupil', pupilObj)
                      .then(function successCallback(response) {
                        ngDialog.closeAll();
                      }, function errorCallback(response) {
                        console.log('error', response.err)
                      });
                  }
                }
              }
            })
            .closePromise.then(function(res) {
              $http.get('http://localhost:8000/pupils')
                .then(function successCallback(response) {
                  $scope.allpupils = response.data;
                }, function errorCallback(response) {
                  console.log("Error!!!" + response.err);
                });
            })
        } else {
          alert("Ви не авторизовані, або у вас замало прав!");
        }
      }
    }
  }
});