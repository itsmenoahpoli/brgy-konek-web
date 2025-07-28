import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Province {
  province_code: string;
  province_name: string;
  psgc_code: string;
  region_code: string;
}

export interface City {
  city_code: string;
  city_name: string;
  province_code: string;
  psgc_code: string;
  region_desc: string;
}

export interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  region_code: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhilippineAddressesService {
  constructor(private http: HttpClient) {}

  getProvinces(): Observable<Province[]> {
    console.log('Loading provinces...');
    return this.http.get<Province[]>('assets/province.json').pipe(
      tap((provinces) => {
        console.log('Provinces loaded from service:', provinces.length);
        if (provinces.length > 0) {
          console.log('First province:', provinces[0]);
        }
      })
    );
  }

  getCities(): Observable<City[]> {
    console.log('Loading cities...');
    return this.http.get<City[]>('assets/city.json').pipe(
      tap((cities) => {
        console.log('Cities loaded from service:', cities.length);
        if (cities.length > 0) {
          console.log('First city:', cities[0]);
        }
      })
    );
  }

  getBarangays(): Observable<Barangay[]> {
    console.log('Loading barangays...');
    return this.http.get<Barangay[]>('assets/barangay.json').pipe(
      tap((barangays) => {
        console.log('Barangays loaded from service:', barangays.length);
        if (barangays.length > 0) {
          console.log('First barangay:', barangays[0]);
        }
      })
    );
  }

  getCitiesByProvince(provinceCode: string): Observable<City[]> {
    console.log('Filtering cities for province:', provinceCode);
    return this.getCities().pipe(
      map((cities) => {
        const filtered = cities.filter(
          (city) => city.province_code === provinceCode
        );
        console.log(
          `Found ${filtered.length} cities for province ${provinceCode}`
        );
        return filtered;
      })
    );
  }

  getBarangaysByCity(cityCode: string): Observable<Barangay[]> {
    console.log('Filtering barangays for city:', cityCode);
    return this.getBarangays().pipe(
      map((barangays) => {
        const filtered = barangays.filter(
          (barangay) => barangay.city_code === cityCode
        );
        console.log(`Found ${filtered.length} barangays for city ${cityCode}`);
        return filtered;
      })
    );
  }
}
