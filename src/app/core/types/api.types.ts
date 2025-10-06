// Common response structure matching backend
export interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: ErrorDetails | null;
  timestamp: string;
}

export interface ErrorDetails {
  code?: string | null;
  details?: string | null;
}

// Date information structures
export interface DateInfo {
  day: number;
  month: number;
  year: number;
  month_name: string;
  day_name: string
  formatted: string;
  iso: string;
}

export interface HijriDateInfo extends DateInfo {}

export interface GregorianDateInfo extends DateInfo {}

// Prayer times structure
export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunset: string;
}

// Location information
export interface LocationInfo {
  longitude?: number | null;
  latitude?: number | null;
  city_name?: string | null;
  city_id?: number | null;
}

// Date conversion result
export interface DateConversionResult {
  hijri_date: HijriDateInfo;
  gregorian_date: GregorianDateInfo;
  hijri_formatted: string;
  gregorian_formatted: string;
  day_name?: string | null;
}

// Prayer time with date result
export interface PrayerTimeWithDateResult {
  day_name: string;
  hijri_date: HijriDateInfo;
  gregorian_date: GregorianDateInfo;
  prayer_times: PrayerTimes;
  location: LocationInfo;
}

// Daily prayer time
export interface DailyPrayerTime {
  hijri_date: HijriDateInfo;
  gregorian_date: GregorianDateInfo;
  day_name: string;
  prayer_times: PrayerTimes;
}

// Monthly prayer times result
export interface MonthlyPrayerTimesResult {
  days_in_month: number;
  location: LocationInfo;
  daily_prayer_times: DailyPrayerTime[];
}

// Calendar structures
export interface CalendarDay {
  hijri_day: number;
  gregorian_date: string;
  gregorian_month_name: string;
  gregorian_day_name: string;
  gregorian_day_name_ar: string;
  prayer_times: DailyPrayerTime;
}

export interface CalendarMonth {
  hijri_month_number: number;
  hijri_month_name: string;
  gregorian_month_number: number;
  gregorian_month_name: string;
  days: DailyPrayerTime[];
}

export interface CalendarYearResult {
  location: LocationInfo;
  months: CalendarMonth[];
  daily_prayer_times: DailyPrayerTime[];
}

export interface CalendarDayResult {
  location: LocationInfo;
  days: DailyPrayerTime[];
}

// Qibla result
export interface QiblaResult {
  qibla: string;
  location: LocationInfo;
}

// City prayer time
export interface CityPrayerTime {
  city_name: string;
  prayer_times: PrayerTimes;
}

// Prayer times by cities result
export interface PrayerTimesByCitiesResult {
  gregorian_date: GregorianDateInfo;
  hijri_date: HijriDateInfo;
  city_prayer_times: CityPrayerTime[];
}

// Reference data types
export interface WeekDayResult {
  day_id: number;
  day_name: string;
}

export interface MonthResult {
  month_number: string;
  month_name: string;
}

export interface CityResult {
  id: number;
  name: string;
}

// App settings types
export interface AppSettingDto {
  appsetting_id: number;
  slug?: string | null;
  for_app: string;
  for_platform?: string | null;
  contact_phone: string;
  contact_email: string;
  contact_whats_app: string;
  web_site_link: string;
  share_link?: string | null;
  facebook_link?: string | null;
  instagram_link?: string | null;
  snapchat_link?: string | null;
  tiktok_link?: string | null;
  twitter_link?: string | null;
  messenger_link?: string | null;
  app_version: number;
  latitude?: number | null;
  longitude?: number | null;
  location_link?: string | null;
  enable_signup: number;
  enable_as_guest: number;
  enabled_auth_phone_otp: number;
  enabled_auth_gmail: number;
  enabled_auth_facebook: number;
  enabled_auth_apple: number;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface AppLanguageDto {
  applang_id: number;
  slug?: string | null;
  full_name: string;
  short_name: string;
  icon?: string | null;
  status: string;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface CountryDto {
  country_id: number;
  slug: string;
  flag?: string | null;
  name: string;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface CityDto {
  city_id: number;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface PrayerDto {
  pray_id: number;
  slug: string;
  type: string;
  icon: string;
  name: string;
  desc?: string | null;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface AppSettingResult {
  setting: AppSettingDto;
  applangs: AppLanguageDto[];
  countries: CountryDto[];
  cities: CityDto[];
  prays: PrayerDto[];
}

// Static page types
export interface StaticPageDto {
  staticpage_id: number;
  slug?: string | null;
  page_link: string;
  title: string;
  text: string;
  for_app: string;
  for_platform: string;
  update_date: string;
  the_date: string;
  the_time: string;
  date_time: string;
  created_ago: string;
}

export interface StaticPageResult {
  static_page: StaticPageDto;
}
///////////////////////////////////////////////////
export interface BaseResponse<T> {
  result: T;
  success: boolean;
  error: Error | null
  unAuthorizedRequest: boolean;
  __abp: boolean;
}
export interface Result {
  day: number;
  month: number;
  year: number;
  month_name: string;
  iso: string;
  day_name: string;
}
export interface Error {
  code: string
  message: string
  details: string
  validationErrors: ValidationError[]
}

export interface ValidationError {
  message: string
  members: string[]
}
export interface GregorianDateInput {
  day: number;
  month: number;
  year: number;
}

export interface HijriDateInput {
  day: number;
  month: number;
  year: number;
}
export interface FarmerDate {
  
  [key: string]: any;
}
export interface PrayerTime {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunset: string;
  hijri_date: DateInfo;
  gregorian_date: DateInfo;
  farmer_date?: FarmerDate;
}

export interface MonthPrayerTimes {
  month: number;
  prayerTimes: PrayerTime[];
}
export interface DurationPrayerTimes {
  prayerTimes: PrayerTime[];
}


