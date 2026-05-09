const test = require('node:test');
const assert = require('node:assert/strict');

const {
  selectPexelsPhoto,
} = require('./enrich-place-images.js');

test('selectPexelsPhoto rejects zoo and animal attraction false positives', () => {
  const place = {
    name: 'Chileense flamingo',
    category: 'attraction',
    cities: { name_en: 'Amsterdam' },
    raw_data: { osm: { tags: { attraction: 'animal', tourism: 'attraction' } } },
  };

  const selected = selectPexelsPhoto(place, [
    {
      alt: 'Amsterdam travel landmark',
      photographer: 'City Views',
      url: 'https://pexels.com/photo/amsterdam-canal',
      src: { large: 'https://images.pexels.com/photos/1/test.jpeg' },
    },
    {
      alt: 'flamingo in zoo enclosure',
      photographer: 'Wildlife Lens',
      url: 'https://pexels.com/photo/flamingo-zoo',
      src: { large: 'https://images.pexels.com/photos/2/test.jpeg' },
    },
  ]);

  assert.equal(selected, null);
});

test('selectPexelsPhoto rejects city-only matches for generic names', () => {
  const place = {
    name: 'Dam',
    category: 'landmark',
    cities: { name_en: 'Amsterdam' },
  };

  const selected = selectPexelsPhoto(place, [
    {
      alt: 'Amsterdam skyline at sunset',
      photographer: 'City Views',
      url: 'https://pexels.com/photo/amsterdam-skyline',
      src: { large: 'https://images.pexels.com/photos/3/test.jpeg' },
    },
  ]);

  assert.equal(selected, null);
});

test('selectPexelsPhoto keeps place-specific architectural matches', () => {
  const place = {
    name: 'Palau de la Música Catalana',
    category: 'landmark',
    cities: { name_en: 'Barcelona' },
  };

  const selected = selectPexelsPhoto(place, [
    {
      alt: 'Palau de la Música Catalana facade in Barcelona',
      photographer: 'Travel Lens',
      url: 'https://pexels.com/photo/palau-facade',
      src: { large: 'https://images.pexels.com/photos/4/test.jpeg' },
    },
  ]);

  assert.equal(selected?.src?.large, 'https://images.pexels.com/photos/4/test.jpeg');
});
