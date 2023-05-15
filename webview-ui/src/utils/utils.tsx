
//Object
//Array
//String
//Number
//bool

const isArray = (val: any) => val instanceof Array;
const isObject = (val: any) => val instanceof Object;
const isNumer = (val: any) => typeof val == "number";
const isString = (val: any) => typeof val == "string";


const toObject = (data: any) => {
  if (isArray(data)) {
    let [val, ...rem] = data;
    if (isNumer(val) && isObject(rem) && data.length == 2) {
      var array = new Array(val).fill(0);
      array.forEach((element: any, index: number) => {
        const objArr = JSON.parse(JSON.stringify(data[1]));
        array[index] = toObject(objArr);
      });
      return array;
    }

    data.forEach((element: any, index: number) => {
      element = toObject(element);
    });
    return data;
  } else if (isObject(data)) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        data[key] = toObject(value);
      }
    }
    return data;
  } else if (isString(data)) {
    return `${data}`;
  }else{
    return data
  }
};

const JsonFunParser = (data: any) => {

  let parsedObj = JSON.parse(data);
  return JSON.stringify(toObject(parsedObj), null, 2);
};

export default JsonFunParser;
