const rewire = require('rewire');

const index = rewire('./index');

const jsonDepth = index.__get__('jsonDepth');

describe('react-native-logging', () => {
  describe('jsonDepth', () => {
    it('should return the same object if level is not deeper', () => {
      const object = { a: 1 };
      expect(jsonDepth(object, 2)).toEqual(object);
    });

    it('should return the same array if level is not deeper', () => {
      const array = [1];
      expect(jsonDepth(array, 2)).toEqual(array);
    });

    it('should crop object depth', () => {
      const object = {
        a: {
          b: { c: { d: 1 } },
          b1: 'test',
          b2: [0]
        }
      };
      expect(jsonDepth(object, 2)).toEqual({
        a: {
          b: '[object]',
          b1: 'test',
          b2: '[array]'
        }
      });
    });

    it('should crop cyclic objects', () => {
      const object = {};
      object.a = object;
      const cropped = jsonDepth(object, 2);
      expect(cropped.a.a).toEqual('[object]');
    });

    it('should crop cyclic arrays', () => {
      const array = ['first'];
      array[1] = array;
      const cropped = jsonDepth(array, 2);
      expect(cropped).toEqual(['first', ['first', '[array]']]);
    });
    
    it('should pass a date', () => {
      const date = new Date();
      expect(jsonDepth({ date }, 2)).toEqual({ date });
    });
    
    it('should pass null', () => {
      expect(jsonDepth({ n: null }, 2)).toEqual({ n: null });
    });
  });
});
