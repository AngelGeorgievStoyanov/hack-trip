export interface SelectOptionDto {
  id: number;
  selectTypeId: number;
  key: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SelectConfigDto {
  id: number;
  key: string;
  name: string;
  isActive: boolean;
  options: SelectOptionDto[];
}

export type ServiceConfigValueType = 'string' | 'number' | 'boolean' | 'json';

export interface ServiceConfigDto {
  id: number;
  serviceTypeId: number;
  key: string;
  value: string;
  type: ServiceConfigValueType;
  isActive: boolean;
}

export type PublicServiceKey = 'google_maps' | 'mui' | 'ui' | 'visual' | 'routing';

export interface PublicServiceConfigDto {
  id: number;
  key: PublicServiceKey;
  name: string;
  isActive: boolean;
  configs: ServiceConfigDto[];
}
