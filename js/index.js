$(document).ready(function() {
  $('#equalizer').equalizer({
    title: "Genre Equalizer",
    showSectionValue: true,
    linked: true,
    sections: [
      { name: "Rock", value: 50, changeListener: changeListener },
      { name: "Pop", value: 20, changeListener: changeListener },
      { name: "Electro", value: 75, changeListener: changeListener }
    ]
  });
});

function changeListener(name, value) {
  $('#equa-'+name.toLowerCase()).text(name+': '+value);
}