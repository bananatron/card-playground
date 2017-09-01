var resetGame = function() {
    uploadMessage(window.player + " reset game!");
    var allCardsRef = firebase.database().ref('/cards');
    allCardsRef.remove();
}

var postMessage = function(message){
    var $modal = $('.message-modal');
    $modal.text(message);
    $modal.removeClass('is-hidden');
    setTimeout(function(){
        $modal.addClass('is-hidden');
    }, 1600)
};

var uploadMessage = function(msg) {
    var messageRef = firebase.database().ref('/message');
    messageRef.set({
        message: msg
    })
};
