class Forex {
    constructor(from, to){
        this.CUR_SYM = {
            'USD': '$',
            'THB': '฿'
        }
        this.CUR_RATE = {
            'USD': 0.029,
            'THB': 1
        }

        var _sessionCurrency = $('#currency').data('currency');
        this.sessionCurrency = _sessionCurrency ? _sessionCurrency : 'THB'
        if (to){
            this.sessionCurrency = to
        }
        // console.log('currency -- ' + this.sessionCurrency);
        this._convert = function(num){
            if (from && to){
                if (from == 'USD' && to == 'THB'){
                    return (num * (1/this.CUR_RATE['USD'])).toFixed(2);
                } else if (from == 'THB' && to == 'USD') {
                    return (num * this.CUR_RATE['USD']).toFixed(2);
                }
            }
            return (num * this.CUR_RATE[this.sessionCurrency]).toFixed(2);
        }
        this.convert();
    }

    convert(){
        // console.log('forex converting');
        var rawPriceTags = $('.forex');
        for(var i = 0; i < rawPriceTags.length; i++){
            var priceTagElm = $(rawPriceTags[i]);
            if (priceTagElm.length){
                var price = priceTagElm.data('price');
                var newPrice = this._convert(Number.parseFloat(price))
                priceTagElm.data('price', newPrice);
                // console.log(price + " -> " + newPrice);
                var priceTxt = this.number_format(newPrice, 2);
                priceTagElm.text(priceTxt);
            }
        }

        var rawCurrencyTags = $('.forex-currency');
        for(var i = 0; i < rawCurrencyTags.length; i++){
            var currencyTagElm = $(rawCurrencyTags[i]);
            if (rawCurrencyTags.length){
                rawCurrencyTags.text(this.CUR_SYM[this.sessionCurrency])
            }
        }
    }

    static changeCurrencyClick(currency){
        if (currency == 'THB'){
            return 'USD'
        }
        return 'THB'
    }

    number_format(number, decimals, dec_point, thousands_sep) {
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            toFixedFix = function (n, prec) {
                // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }
}

$(document).ready(function(){
    new Forex();
});

// number_format notes
// *     example 1: number_format(1234.56);
// *     returns 1: '1,235'
// *     example 2: number_format(1234.56, 2, ',', ' ');
// *     returns 2: '1 234,56'
// *     example 3: number_format(1234.5678, 2, '.', '');
// *     returns 3: '1234.57'
// *     example 4: number_format(67, 2, ',', '.');
// *     returns 4: '67,00'
// *     example 5: number_format(1000);
// *     returns 5: '1,000'
// *     example 6: number_format(67.311, 2);
// *     returns 6: '67.31'
// *     example 7: number_format(1000.55, 1);
// *     returns 7: '1,000.6'
// *     example 8: number_format(67000, 5, ',', '.');
// *     returns 8: '67.000,00000'
// *     example 9: number_format(0.9, 0);
// *     returns 9: '1'
// *    example 10: number_format('1.20', 2);
// *    returns 10: '1.20'
// *    example 11: number_format('1.20', 4);
// *    returns 11: '1.2000'
// *    example 12: number_format('1.2000', 3);
// *    returns 12: '1.200'
