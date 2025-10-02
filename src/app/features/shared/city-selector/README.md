# City Selector Component

This component provides city selection functionality with auto-detect location capabilities for the Umm al-Qura Calendar project.

## Features

- **City Selection**: Dropdown with cities loaded from API
- **Auto-detect Location**: Geolocation API integration to automatically detect user's current position
- **Translation Support**: Full internationalization support for English and Arabic
- **Loading States**: Proper loading indicators and error handling
- **Responsive Design**: Mobile-friendly UI with adaptive button text
- **RTL Support**: Full right-to-left language support for Arabic
- **Location Display**: Shows detected coordinates when using auto-detection

## Location

**Path**: `src/app/features/shared/city-selector/`

## API Integration

The component integrates with the existing API service to fetch cities:

- Uses `ReferenceDataService.getCities()` to load available cities
- Returns city data in the format: `{ id: number, name: string }`

## Component API

### Inputs

- `label?: string` - Translation key for the label (default: 'citySelect.selectCity')
- `disabled: boolean` - Whether the component is disabled (default: false)

### Outputs

- `locationSelect: EventEmitter<LocationData>` - Emitted when location is selected (either from city or auto-detection)
- `citySelect: EventEmitter<string>` - Emitted when a city is selected from dropdown

### Types

```typescript
interface LocationData {
  lat: number;
  lng: number;
  city?: string; // Only present when city is selected
}

interface CityData {
  value: string;
  name: string;
  coordinates: { lat: number; lng: number };
}
```

## Usage

### Basic Import

```typescript
import { CitySelectorComponent, LocationData } from "../shared/city-selector/city-selector.component";

// Or use the index file
import { CitySelectorComponent, LocationData, CityData } from "../shared/city-selector";
```

### Template Usage

```html
<app-city-selector [label]="'citySelect.selectCity'" [disabled]="false" (locationSelect)="onLocationSelect($event)" (citySelect)="onCitySelect($event)"> </app-city-selector>
```

### Component Implementation

```typescript
@Component({
  // ... component config
  imports: [CitySelectorComponent /* other imports */],
})
export class MyComponent {
  onLocationSelect(location: LocationData) {
    console.log("Location selected:", location);
    // Handle location data: { lat: number, lng: number, city?: string }
  }

  onCitySelect(cityId: string) {
    console.log("City selected:", cityId);
    // Handle city selection by ID
  }
}
```

## Features in Detail

### 1. City Selection

- Loads cities from API automatically on component initialization
- Displays loading state while fetching cities
- Shows error message if API call fails
- Emits both city ID and location coordinates when city is selected

### 2. Auto-detect Location

- Uses browser's Geolocation API
- Shows loading spinner during location detection
- Handles various error cases with translated messages:
  - Permission denied
  - Location unavailable
  - Request timeout
  - General errors
- Displays detected coordinates in a formatted box
- Clears city selection when auto-detection is used

### 3. Error Handling

- API errors: Shows translated error message in dropdown
- Geolocation errors: Alert with appropriate translated message
- Graceful fallback for unsupported browsers

### 4. Responsive Design

- Button text adapts to screen size (shows icon only on small screens)
- Mobile-friendly touch targets
- Proper spacing and sizing for different devices

## Styling

The component uses the same design language as other project components:

- **Colors**: Green theme (#1B8354) for focus states and primary actions
- **Icons**: Location icon from `assets/images/location.png`
- **Layout**: Consistent padding, borders, and spacing
- **Animations**: Smooth transitions and loading spinners
- **RTL Support**: Proper positioning for Arabic language

## Translations

All user-facing text is translatable. Translation keys under `citySelect`:

### English Keys

```json
{
  "citySelect": {
    "selectCity": "Select City",
    "selectCityPlaceholder": "Choose a city",
    "loadingCities": "Loading cities...",
    "citiesLoadError": "Error loading cities",
    "getCurrentLocation": "Auto-detect location",
    "autoDetectLocation": "Auto-detect",
    "detectedLocation": "Detected Location",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "geolocationNotSupported": "Geolocation is not supported by this browser",
    "locationDenied": "Location access denied by user",
    "locationUnavailable": "Location information is unavailable",
    "locationTimeout": "Location request timed out",
    "locationError": "Unknown location error"
  }
}
```

### Arabic Translations

All English keys have corresponding Arabic translations in `ar.json`.

## Example Component

See `src/app/features/shared/city-selector-example/city-selector-example.component.ts` for a complete working example with:

- Event handling demonstration
- Results display
- Usage instructions

## Browser Compatibility

- **Geolocation API**: Supported in all modern browsers
- **Fallback**: Graceful degradation for browsers without geolocation support
- **Mobile**: Full support for mobile browsers

## Security Considerations

- **HTTPS Required**: Geolocation API requires HTTPS in production
- **User Permission**: Component properly handles permission requests and denials
- **Privacy**: No location data is stored or transmitted automatically

## Future Enhancements

1. **City Coordinates**: Add actual coordinates to city data from API
2. **Reverse Geocoding**: Convert detected coordinates to city names
3. **Recent Locations**: Remember recently selected locations
4. **Search**: Add search functionality for large city lists
5. **Map Integration**: Optional map view for location selection

## Notes

- Component is standalone (no NgModule required) [[memory:6229932]]
- Uses existing project API services and error handling patterns
- Follows project's translation and styling conventions
- Fully compatible with the existing prayer times and calendar features
