import { differenceWith } from 'src/utils/common.util';

/**
 * It returns the difference between two arrays of objects
 * @param {Type[]} newData - The new data that you want to compare with the old data.
 * @param {Type[]} data - The data that you want to compare against.
 * @param isEqual - (newItem: Type, oldItem: Type) => boolean
 * @returns An array of items that are different between the two arrays.
 */
export const findDifferenceItems = <Type>(
  newData: Type[],
  data: Type[],
  isEqual: (newItem: Type, oldItem: Type) => boolean
): Type[] => {
  let items: Type[] = [];
  try {
    items = differenceWith(newData, data, (newItem: Type, oldItem: Type) => isEqual(newItem, oldItem));
  } catch (error) {
    items = [];
  }
  return items;
};
