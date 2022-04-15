export interface CustomersResponse {
  result: boolean;
  data:   Customer[];
  message:null|string;
}

export interface Customer {
  id:                  number;
  identification:      string;
  name:                string;
  contactName?:        string;
  phoneNumber:         null | string;
  entryDate?:          null | Date;  
  brands:              Brand[];
  marketRegions:       MarketRegion[];
  locationsScreen:     LocationsScreen[];
  sitesComercialCodes: SitesComercialCode[];
  schedules:           Schedule[];
  timeRanges:          TimeRange[];

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

export interface Schedule {
  id:          number;
  description: string;
  startDate:   StartDate;
  weekly:      Weekly[];
  deleted:     boolean;
}

export interface StartDate {
  id:             string;
  description:    string|null;
}

export interface Week {
  id:          string;
  description: string;
}

export interface Month {
  id:          string;
  description: string;
}

export interface Weekly {
  day:            string;
  descriptionDay: string;
  openingTime1:   string;
  closingTime1:   string;
  openingTime2:   string | null;
  closingTime2:   string | null;
}

export interface TimeRange {
  id:             number;
  description:    string;
  start_time:     string;
  end_time:       string;
  id_customer:    number;
  deleted:        boolean;
}
