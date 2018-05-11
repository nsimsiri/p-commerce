var React = require('react');
var sformat = require('util').format
var config = require('../../config');
var LocationSelectComponent = React.createClass({
    getInitialState: function(){
        return {
            locations: [
                "Bangkok", "Chiang-Mai","Chiang-Rai", "Lampang", "Lamphun", "Mae-Hong-Son", "Nan", "Phayao", "Phrae" ,"Uttaradit",
                "Amnat-Charoen", "Bueng-Kan", "Buriram", "Chaiyaphum", "Kalasin", "Khon-Kaen", "Loei", "Maha-Sarakham",
                "Mukdahan", "Nakhon-Phanom", "Nakhon-Ratchasima", "Nong-Bua-Lamphu", "Nong-Khai", "Roi-Et", "Sakon-Nakhon",
                "Sisaket", "Surin", 'Ubon-Ratchathani', 'Udon-Thani', 'Yasothon','Ang-Thong', 'Chai-Nat', 'Kamphaeng-Phet',
                'Lopburi', 'Nakhon-Nayok', 'Nakhon-Sawan', 'Phetchabun', 'Phichit', 'Phitsanulok', 'Phra-Nakhon-Si-Ayutthaya',
                'Samut-Songkhram', 'Saraburi', 'Sing-Buri', 'Sukhothai', 'Suphan-Buri', 'Uthai-Thani','Chachoengsao', 'Chanthaburi',
                'Chonburi', 'Prachinburi', 'Rayong', 'Sa-Kaeo', 'Trat','Kanchanaburi', 'Phetchaburi', 'Prachuap-Khiri-Khan',
                'Ratchaburi', 'Tak','Chumphon', 'Krabi', 'Nakhon-Si-Thammarat', 'Narathiwat', 'Pattani', 'Phang-Nga',
                'Phatthalung', 'Phuket', 'Ranong', 'Satun', 'Songkhla', 'Surat-Thani', 'Trang', 'Yala',
                'Nakhon-Pathom', 'Nonthaburi', 'Pathum-Thani', 'Samut-Prakan', 'Samut-Sakhon'
            ],
            titleName: this.props.titleName
        }
    },


    getItems(){
        var locations = [this.state.locations[0]].concat(this.state.locations.slice(1,this.state.locations.length).sort())
        locations.push("Others");
        return locations.map(function(province){
            return <option id={"location_"+province} value={province} key={province} data-i18n={province}> {province} </option>;
        })
    },

	render: function(){
		return (
			<select className="form-control" name="location" required>
                <option value="" data-i18n="choose-location">เลือกจังหวัด</option>
                {this.getItems()}
			</select>

		)
	}
});

module.exports = LocationSelectComponent;
