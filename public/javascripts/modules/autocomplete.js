const autocomplete = (input, latInput, lngInput) => {
    if(!input) { return; }

    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        const { lat, lng } = place.geometry.location;

        latInput.value = lat();
        lngInput.value = lng();
    });

    input.on('keydown', e => e.keyCode === 13 && e.preventDefault());
}

export default autocomplete;