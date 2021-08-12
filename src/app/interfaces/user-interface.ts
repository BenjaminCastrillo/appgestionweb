export interface UsersResponse {
  result:  boolean;
  data:    User[];
  message: null;
}

export interface User {
  id:               number;
  name:             string;
  surname:          string;
  lastAccess:       null | Date;
  entryDate?:       null | Date;  
  languageId:       number;
  email:            string;
  password:         null | string;
  newPassword?:     boolean;
  rol:              Rol;
  relationship:     null | string;
  notes:            null | string; 
  customerUserList: CustomerUserList[];
  sitesLists:       SitesList[];
  categories:       Category[];
  filter?:          null | boolean;
  blocked:          boolean;
}

export interface Category {
  id: number;
  description: string;
  color:       string;
  deleted:     boolean;
}
export interface Rol {
  id: number;
  description: string;
}

export interface CustomerUserList {
  id:          number;
  id_customer: number;
  name:        string;
  exception:   number;
  deleted:     boolean;
}

export interface SitesList {
  id:            number;
  comercialcode: string;   
}
