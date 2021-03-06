///<reference path="./def/account-manager.d.ts" />

import AesManager from './AesManager'
import ToastManager from './ToastManager'

export default function () {
  let _masterKey: string
  let aesManager
  let theBoss = 'theBoss'
  let _key = 'keyObj'

  this.keyObj = <KeyObjI> Object.create(null)

  this.start = () => {
    this.aesManager = new AesManager()
  }

  this.setMasterKey = (masterKey: string) => {
    if(iCheck(masterKey)) {
      iSetMasterKey(masterKey)
      iLoadKeyFromLocalStorage()
    }
  }

  this.isAuthenticated = ()  => {
      console.log('isAuthenticated wird aufgerufen')
      let tmp = (typeof _masterKey !== "undefined" && _masterKey !== null)
      return tmp
  }

  this.encryptKeyObj = () : string => {
      return this.aesManager.encrypt(_masterKey, JSON.stringify(this.keyObj))
  }

  this.encryptSave = (plainKeyObj: PlainKeyObjI)  => {
    if(plainKeyObj == null || plainKeyObj.title == undefined ||  plainKeyObj.title.length == 0){
      ToastManager.toast('no title')
      } else {
      if(!plainKeyObj.skip){
        if(this.keyObj[plainKeyObj.title] != undefined){
          ToastManager.toast('title exists!')
          return
        }
      }
      if(plainKeyObj.oldTitle && plainKeyObj.title !== plainKeyObj.oldTitle){
        iDelete(plainKeyObj.oldTitle)
      }

      let tmpObj: KeyObjDataI = {} as KeyObjDataI
      tmpObj.type =  plainKeyObj.type
      tmpObj.created = new Date().getTime()
      if(tmpObj.type === 1){
        tmpObj.user = this.aesManager.encrypt(_masterKey + tmpObj.created, plainKeyObj.user)
        tmpObj.pass = this.aesManager.encrypt(_masterKey + tmpObj.created, plainKeyObj.pass)
      } else {
        tmpObj.text = this.aesManager.encrypt(_masterKey + tmpObj.created, plainKeyObj.text)
      }
      this.keyObj[plainKeyObj.title] = tmpObj
      iSaveKey()
    }
  }

  this.deleteSave = (title: string)  => {
    if(this.keyObj.hasOwnProperty(title)){
      delete this.keyObj[title]
      iSaveKey()
      ToastManager.toast(`delete ${title}`)
    }
  }

  this.decrypt = (created: number, encText: string) : string  => {
    return this.aesManager.decrypt(_masterKey + created, encText)
  }

  this.decryptKeyObj = (encText: string) : KeyObjI  => {
    return JSON.parse(this.aesManager.decrypt(_masterKey, encText))
  }

  this.saveKey = () : void => {
    iSaveKey()
  }

  let iCheck = (masterKey: string) : boolean => {
    if(masterKey && masterKey !== '' && masterKey.length > 4) {
      let loginPass = localStorage.getItem(theBoss)
      if(loginPass === null) {
        console.log('first login')
        localStorage.setItem(theBoss, this.aesManager.encrypt(masterKey, theBoss))
        ToastManager.toast('Please notice your masterkey for relogin!')
        return true
      } else {
        //login
        console.log('login process')
        if(theBoss === this.aesManager.decrypt(masterKey, loginPass)) {
          //success
          ToastManager.toast('hey!')
          return true
        } else {
          //error
          ToastManager.toastAction('Come on! Do you want reset your account?', () => localStorage.clear())
          return false
        }
      }
    } else {
      return false
    }
  }

  let iSetMasterKey = (masterKey: string) : void => {
    _masterKey = masterKey
  }

  let iSaveKey = () : void => {
    localStorage.setItem(_key, JSON.stringify(this.keyObj))
  }

  let iLoadKeyFromLocalStorage = () => {
    let tmpObj = JSON.parse(localStorage.getItem(_key))
    if(tmpObj === null) {
      console.log('key was null')
    } else {
      this.keyObj = tmpObj
    }
  }

  let iDelete = (title: string) => {
    if(this.keyObj.hasOwnProperty(title)) {
      delete this.keyObj[title]
    }
  }

}