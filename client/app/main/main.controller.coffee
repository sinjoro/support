'use strict'

angular.module 'supportApp'
.controller 'MainCtrl', ($scope, $http, socket, Auth) ->
  $scope.messages = []
  $scope.currentUser = Auth.getCurrentUser()
  dialog = 'support:' + $scope.currentUser._id;
  $http.get('/api/messages/' + dialog).success (messages) ->
    $scope.messages = messages
    socket.syncUpdates 'message', $scope.messages

  $scope.addMessage = ->
    return if $scope.newMessage is ''
    $http.post '/api/messages/support',
      text: $scope.newMessage

    $scope.newMessage = ''


  $scope.$on '$destroy', ->
    socket.unsyncUpdates 'message'
