import { ScreenLocation } from './venue-interface';
import { Customer } from './site-interface';

export interface UsersResponse {
  result:  boolean;
  data:    User[];
  message: null;
}

export interface SitesListResponse {
  result:  boolean;
  data:    SitesList[];
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
  sitesList:        SitesList[];
  categories:       Category[];
  filter?:          null | boolean;
  blocked:          boolean;
}

export interface Category {
  id:            number;
  description:   string;
  color:         string;
  deleted:       boolean;
}
export interface Rol {
  id:           number;
  description:  string;
}

export interface CustomerUserList {
  id:            number;
  customerId:    number;
  customerName:  string;
  identification:string
  exception:     number;
  deleted:       boolean;
}



export interface SitesList {
  id:              number;
  siteId:          number;  
  siteComercialId: string; 
  venueName:       string;
  customer:        Customer;
  exception?:      number;
  deleted:         boolean;
}
