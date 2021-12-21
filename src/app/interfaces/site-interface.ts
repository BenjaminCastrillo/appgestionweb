export interface SitesResponse {
  result: boolean;
  data:   Site[];
}

export interface Site {
  id:                  number;
  siteComercialId:     string;
  idpti:               string;
  venueId:             number;
  name?:               string;
  customer:            Customer;
  network:             Network;
  status:              Status;
  entryDate:           Date;
  image:               string;
  publicScreen:        boolean;
  on_off:              boolean;
  text:                null;
  screenLocation:      ScreenLocation;
  screen:              Screen;
  player:              Player;
  category?:           Category[];
  filter?:             boolean    ;
  location?:           Location[];
  roadType?:           RoadType;
  address?:            string;
  streetNumber?:       string;
  postalCode?:         string;
  latitude?:           string;
  longitude?:          string;
  descriptionLocation?:string;
}


export interface Customer {
  id:             number;
  identification: string;
  name:           string;
}

export interface Network {
  id:          number;
  description: string;
}

export interface Status {
  id:          number;
  description: string;
}

export interface ScreenLocation {
  id:           number | null;
  description?: null | string;
  deleted?:     boolean | null;
}

export interface Category {
  id:            number;
  description:   string;
  color:         string;
  user:          string;
}

export interface Location {
  id:                          number;
  territorialOrganizationId:   number;
  territorialOrganizationName: string;
  hierarchy?:                  number|null;
  territorialEntityId:         number;
  territorialEntityName:       string;
}

export interface RoadType {
  id:          number;
  description: string;
}

export interface Screen {
  id:               number;
  inches:           number | null;
  screenBrand:      ScreenBrand;
  screenModel:      Model;
  resolutionWidth:  number | null;
  resolutionHeight: number | null;
  screenType:       ScreenType;
  pixel:            number | null;
  orientation:      Orientation;
  screenWidth:      number | null;
  screenHeight:     number | null;
  modulesWidth:     number | null;
  modulesHeight:    number | null;
  serialNumber:     string | null;
  situation:        string|null;
}

export interface ScreenBrand {
  id:          number;
  description: string;
}

export interface Model{
  id:          number;
  description: string;
}

export interface ScreenModel {
  id:               number;
  description:      string; 
  screenBrandId:    number;
  screenTypeId:     number;
  screenType:       string;
  resolutionWidth:  number;
  resolutionHeight: number;
  measureWidth:     number;
  measureHeight:    number;
  pixel:            number;
  inches:           number;
  panel:            boolean;
}

export interface ScreenType {
  id:          number ;
  description: string ;
  panel:       boolean;
} 

export interface Orientation {
  id:          number;
  description: string;
}

export interface Player {
  id:            number;
  serialNumber:  string;
  mac:           string;
  orientation:   Orientation;
  os:            Os;
  osVersion:     string;
  appVersion:    string;
  license:       License;
}

export interface Os {
  id:          number;
  description: string;
}

export interface License {
  id:                number;
  activationDate:    Date;
  expirationDate:    Date;
  durationMonths:    number
  licenseNumber:     string;
  valid:             boolean;
  text:              string | null;
}

export interface siteStatus {
  siteId:         number;
  newStatus:      number;
}

