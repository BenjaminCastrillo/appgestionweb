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
  filter?:      null | boolean;
  entryDate?:   null | Date;  
}

export interface Brand {
  id:          number;
  description: string;
  color:       string;
  image:       string;
  deleted:     boolean;
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
}

export interface PhoneNumber {
  number: string;
  notes:  null | string;
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
  territorialEntityId:         number;
  territorialEntityName:       string;
}


export interface MarketRegion {
  id:           number | null;
  description?: null | string;
  deleted?:     boolean | null;
}

export interface Schedule {
  id:          string;
  description: string;
  weekly:      Weekly[];
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
  customerId:      number;
  network:         Network;
  status:          Status;
  entry_date:      Date;
  public_:         boolean;
  on_off:          boolean;
  text_:           null;
  screenLocation:  ScreenLocation;
  category:        any[];
  screen:          Screen;
  player:          Player;
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

export interface Player {
  id:            number;
  serialNumber:  string;
  mac:           string;
  orientation:   Orientation;
  os:            Os;
  osVersion:     string;
  appVersion:    string;
  activeLicense: boolean;
}


export interface Orientation {
  id:          string;
  description: string;
}

export interface Os {
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
  id:          string;
  description: string;
}
export interface ScreenModel {
  id:          string;
  description: string;
}
export interface ScreenType {
  id:          string;
  description: string;
}