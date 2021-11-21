export interface VenuesResponse {
  result: boolean;
  data:   Venue[];
}

export interface Venue {
  id:           number;
  customer:     Customer;
  name:         string;
  image:        string;
  country:      Country;
  location:     Location[];
  roadType:     RoadType;
  address:      string;
  streetNumber: string;
  postalCode:   string;
  latitude:     string;
  longitude:    string;
  marketRegion: null | MarketRegion;
  brand:        null | Brand;
  contact:      Contact[];
  schedule:     Schedule[];
  sites:        Site[];
  newSite?:     NewSite[];
  filter?:      null | boolean;
  entryDate?:   null | Date;  
}


export interface Customer {
  id:             number;
  identification: string;
  name:           string;
}

export interface Contact {
  id:           number;
  name:         string;
  email:        string;
  notes:        string;
  phoneNumbers: PhoneNumber[];
  deleted?:     boolean | null;
}

export interface PhoneNumber {
  id:           number;
  number:       string;
  notes:        null | string;
  deleted?:     boolean | null;
}

export interface Country {
  id:          number;
  description: string;
}
export interface RoadType {
  id:          number;
  description: string;
}

export interface Location {
  id:                          number;
  territorialOrganizationId:   number;
  territorialOrganizationName: string;
  hierarchy?:                  number|null;
  territorialEntityId:         number;
  territorialEntityName:       string;
}

export interface Brand {
  id:          number;
  description: string;
  color:       string;
  image:       string;
  deleted:     boolean;
}

export interface MarketRegion {
  id:           number | null;
  description?: string | null;
  deleted?:     boolean| null;
}

export interface Schedule {
  id:             number;
  idCustomerSchedule?:    number|null;
  description:    string;
  startDate:      StartDate;
  weekly:         Weekly[];
  deleted?:       boolean | null;
}

export interface StartDate {
  id:             string | null;
  description:    string;
}

export interface Weekly {
  day:            string;
  descriptionDay: string;
  openingTime1:   string;
  closingTime1:   string;
  openingTime2:   string;
  closingTime2:   string;
}


export interface Site {
  id:              number;
  siteComercialId: string;
  idpti:           string;
  venueId:         number;
  customer:        Customer;
  network:         Network;
  status:          Status;
  entryDate:       Date;
  image:           string;
  publicScreen:    boolean;
  on_off:          boolean;
  text:            null | string;
  screenLocation:  ScreenLocation;
  category:        Category[];
  screen:          Screen;
  player:          Player;
}

export interface NewSite {
  comercialCodeId: number;
  licenseDuration: number;
}
export interface Network {
  id:          string;
  description: string;
}

export interface Status {
  id:          string;
  description: string;
}

export interface ScreenLocation {
  id:           number | null;
  description?: null | string;
  deleted?:     boolean | null;
}

export interface Category {
  id:           number;
  description: string;
  color:       string;
  user:        string;
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


export interface Orientation {
  id:          number;
  description: string;
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
}

export interface Week {
  id:          string;
  description: string;
}


export interface Screen {
  id:               number;
  inches:           number | null;
  screenBrand:      ScreenBrand;
  screenModel:      ScreenModel;
  resolutionWidth:  number;
  resolutionHeigth: number;
  screenType:       ScreenType;
  pixel:            null;
  orientation:      Orientation;
  cabinetsWidth:    number | null;
  cabinetsHeigth:   number | null;
}

export interface ScreenBrand {
  id:          number;
  description: string;
}
export interface ScreenModel {
  id:          number;
  description: string;
}
export interface ScreenType {
  id:          number;
  description: string;
}

export interface TerritorialOrganization {
  id:                          number;
  territorialOrganizationName: string;
  hierarchy:                   number;
}
export interface TerritorialEntities {
  id:                          number;
  territorialEntityName:       string;
  territorialEntityIdRelation: number;
}