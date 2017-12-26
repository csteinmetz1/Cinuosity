var rangeSlider = document.getElementById('range');

noUiSlider.create(rangeSlider, {
	start: [ 50 ],
	range: {
		'min': [  0 ],
		'max': [ 100 ]
  },
  pips: {
		mode: 'range',
		density: 10
	}
});

var rangeSliderSayingElement = document.getElementById('slider-range-saying');
var rangeSliderValueElement = document.getElementById('slider-range-value');

rangeSlider.noUiSlider.on('update', function( values, handle ) {
  if (values[handle] > 89) {
    rangeSliderSayingElement.innerHTML = 'buckle up';
  } else if (values[handle] > 79) {
    rangeSliderSayingElement.innerHTML = 'too weird';
  } else if (values[handle] > 69) {
    rangeSliderSayingElement.innerHTML = 'very weird';
  } else if (values[handle] > 59) {
    rangeSliderSayingElement.innerHTML = 'weirder';
  } else if (values[handle] > 49) {
    rangeSliderSayingElement.innerHTML = 'weird';
  } else if (values[handle] > 39) {
    rangeSliderSayingElement.innerHTML = 'almost weird';
  } else if (values[handle] > 29) {
    rangeSliderSayingElement.innerHTML = 'eh';
  } else if (values[handle] > 19) {
    rangeSliderSayingElement.innerHTML = 'not weird';
  } else if (values[handle] > 9) {
    rangeSliderSayingElement.innerHTML = 'normie';
  } else {
    rangeSliderSayingElement.innerHTML = 'why bother';
  }
  rangeSliderValueElement.innerHTML = values[handle];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUNFO0lBQUEsS0FBQSxFQUFPLEtBQVA7SUFDQSxHQUFBLEVBQUssR0FETDtJQUVBLEtBQUEsRUFBTyxFQUZQO0lBR0EsS0FBQSxFQUFPLFFBQUEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFBO01BQ0wsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixFQUFFLENBQUMsS0FBekI7SUFESztFQUhQLENBREY7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIiQoXCIjcmFuZ2VcIikuc2xpZGVyXG4gIHJhbmdlOiBcIm1pblwiXG4gIG1heDogMTAwXG4gIHZhbHVlOiA1MFxuICBzbGlkZTogKGUsIHVpKSAtPlxuICAgICQoXCIjY3VycmVudFZhbFwiKS5odG1sIHVpLnZhbHVlXG4gICAgcmV0dXJuIl19
//# sourceURL=coffeescript