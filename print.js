window.airtable_key = 'keyhdUvEUU5IL7Aqs';

console.log('Print yay!');


// Get cards from airtable

$.ajax({
    url: "https://api.airtable.com/v0/appzXeslgG8oxXqRL/Card%20List",
    headers: {"Authorization": "Bearer keyhdUvEUU5IL7Aqs"}
}).done(function(data) {
    console.log('Got airtable card data...')

    data.records.forEach(function(card) {
        var cardFields = card.fields;
        var $template = $(".print-card-template").clone();
        $template.removeClass('print-card-template')
        $template.addClass('print-card')

        if (cardFields['Cost']) {
            $template.find('.cost').text(cardFields['Cost'])
            $template.find('.cost').addClass('is-visible')
        }

        if (cardFields['Mojo']) {
            $template.find('.mojo').text(cardFields['Mojo'])
            $template.find('.mojo').addClass('is-visible')
        }

        $template.find('.mojo').text(cardFields['Mojo'])
        $template.find('.description').html(cardFields['Description'])
        $template.find('.title').text(cardFields['Card Name'])
        if (cardFields['Lowfi Art']) {
            $template.find('.art').css('background-image', `url('${cardFields["Lowfi Art"][0].url}')`)
        }
        console.log(cardFields)
        $template.addClass(`is-${cardFields["Type"]}`)
        $template.appendTo('#new-cards')
    })

}).fail(function(data) {
    alert('‼️ Failure connecting to airtable for cardlist')
    console.log('‼️ Failure connecting to airtable for cardlist', data)
});
