import {
  setStorage,
  setStorageSync,
  getStorage,
  getStorageSync,
  removeStorageSync,
} from "@tarojs/taro";

class CustomizeStorage {
  saveT: string;
  value: string;
  expire: string;
  constructor() {
    this.saveT = "saveT";
    this.value = "value";
    this.expire = "expire";
  }

  // 默认过期时间为0， 表示永不过时
  public setStorage = ({ key, data, expire = 0 }) => {
    const saveValue = {};
    this.ObjectAddKey(saveValue, this.saveT, Date.now());
    this.ObjectAddKey(saveValue, this.value, data);
    this.ObjectAddKey(saveValue, this.expire, expire);

    setStorage({
      key,
      data: saveValue,
    });
  };

  public setStorageSync = (key: string, data: any, expire: number = 0) => {
    const saveValue = {
      saveT: Date.now(),
      value: data,
      expire,
    };

    this.ObjectAddKey(saveValue, this.saveT, Date.now());
    this.ObjectAddKey(saveValue, this.value, data);
    this.ObjectAddKey(saveValue, this.expire, expire);
    setStorageSync(key, saveValue);
  };

  public getStorage = ({ key, complete, fail, success }) => {
    if (![key, complete, success].every((v) => this.checkFunction(v))) {
      throw new Error("callback must be a function");
    }
    getStorage({
      key,
      complete: (res) => {
        let completeData: null | any = null;
        if (!res.hasOwnProperty("data")) {
          completeData = res;
          fail(res);
        } else {
          const response = this.checkStorageValid(res.data, key);
          completeData = {
            ...res,
            data: response,
          };
          success(response);
        }
        complete(completeData);
      },
    });
  };

  public getStorageSync = (key) => {
    const response = getStorageSync(key);
    return this.checkStorageValid(response, key);
  };

  private checkStorageValid = (response, key) => {
    // 根据保存时间和过期时间判断是否过期
    try {
      // 兼容老版本，如果返回的不是对象说明是之前写的逻辑，返回原始数据
      if (Object.prototype.toString.call(response) !== "[object Object]")
        return response;
      // 如果返回的是对象，但没有同时设置过期时间，也是原有的存储逻辑，直接返回
      if (
        ![this.value, this.expire, this.saveT].every((key) =>
          response.hasOwnProperty(key)
        )
      )
        return response;
      const expire = Reflect.get(response, this.expire);
      const saveT = Reflect.get(response, this.saveT);
      const value = Reflect.get(response, this.value);
      if (expire === 0) return value;
      if (Date.now() - saveT > expire) {
        removeStorageSync(key);
        return null;
      }
      return value;
    } catch (e) {
      return null;
    }
  };

  private checkFunction = (param) => {
    try {
      return param.constructor.name === "Function";
    } catch (e) {
      return false;
    }
  };

  private ObjectAddKey = (object, key, value) => {
    Reflect.set(object, key, value);
  };
}
const storage: any = new CustomizeStorage();

export default storage;
