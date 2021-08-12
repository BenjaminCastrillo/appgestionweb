export interface CustomersResponse {
  result: boolean;
  data:   Customer[];
  message:null|string;
}

export interface Customer {
  id:                  number;
  identification:      string;
  name:                string;
  phoneNumber:         null | string;
  entryDate?:          null | Date;  
  brands:              Brand[];
  marketRegions:       MarketRegion[];
  locationsScreen:     LocationsScreen[];
  sitesComercialCodes: SitesComercialCode[];
}

export interface Brand {
  id:          number;
  description: string;
  image:       null;
  color:       string;
  id_customer: number;
  deleted:     boolean;
}

export interface LocationsScreen {
  id:          number;
  description: string;
  id_customer: number;
  deleted:     boolean;
}

export interface MarketRegion {
  id:               number;
  description:      string;
  id_customer:      number;
  deleted:          boolean;
}

export interface SitesComercialCode {
  id:          number;
  acronym:     string;
  id_customer: number;
  deleted:     boolean;
}
