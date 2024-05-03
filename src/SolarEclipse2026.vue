<template>
<v-app
  id="app"
  :style="cssVars"
>

  <!-- Top content box with map, location, time, and option icons -->
  <div id="closed-top-container" :class="[!showGuidedContent ?'budge' : 'open']">
    <icon-button
      v-model="showGuidedContent"
      id="show-guided-content"
      ref="showGuidedContent"
      :fa-icon="showGuidedContent ? 'times' : 'chevron-down'"
      :fa-size="showGuidedContent ? 'lg' : 'lg'"
      :color="accentColor"
      :focus-color="showGuidedContent ? skyColor : accentColor"
      :tooltip-text="showGuidedContent ? 'Hide' : 'Click to learn more'"
      :tooltip-location="'bottom'"
      :show-tooltip="!mobile"
      :box-shadow="false"
      @activate="() => {
        // console.log('showGuidedContent = ', showGuidedContent);
        // showGuidedContent = !showGuidedContent;
        onResize();
      }"
    >
    <template v-if="!showGuidedContent" v-slot:button>
      Map & Weather <font-awesome-icon icon="chevron-down" class="bullet-icon"/>
    </template>
  </icon-button>
  </div>
  <v-container id="guided-content-container" v-show="showGuidedContent">
    <div id="non-map-container">
        <div id="title-row" class="non-map-row">

            <div id="title">
              <span v-if="learnerPath=='Location'"
                >Choose Any Location
              </span>
              <span v-if="learnerPath=='Clouds'"
                >View Historical Cloud Data
              </span>
              <span v-if="!showNewMobileUI && learnerPath=='CloudDetail'"
                >Explore Detailed Cloud Data
              </span>
            </div>

        </div>
        <div id="instructions-row" class="non-map-row">
          <div id="top-container-main-text">                    
            <!-- Choose Path -->
            <div class="instructions-text" v-if="learnerPath=='Location'">

              <span class="description">                
                <div v-if="infoPage==1">
                  <p v-if="queryData.latitudeDeg == undefined || queryData.longitudeDeg == undefined">
                    "Watch" the eclipse from the location marked by the red dot on the map, or <strong>drag</strong> the yellow dot along the bottom slider to change time.
                  </p>
                  <p v-if="queryData.latitudeDeg !== undefined && queryData.longitudeDeg !== undefined">
                    "Watch" the eclipse from the location shared in your link, or <strong>drag</strong> the yellow dot along the bottom slider to change time.
                  </p>
                  <p>
                    <strong>{{ touchscreen ? "Tap" : "Click" }}</strong> the map to select any <span v-if="queryData.latitudeDeg !== undefined && queryData.longitudeDeg !== undefined">other</span> location and view the eclipse from there, or
                  </p>
                  <p v-if="narrow">
                    <font-awesome-icon icon="magnifying-glass" class="bullet-icon"
                    size="lg"/> Search for a location
                  </p>
                  <p v-if="narrow">
                    <font-awesome-icon icon="location-crosshairs" class="bullet-icon"
                    size="lg"/> Use my location (if enabled)
                  </p>
                  <p v-if="narrow">
                    <v-icon icon="mdi-sun-clock" size="small" class="bullet-icon"></v-icon>
                    See detailed eclipse times
                  </p>
                  <p v-else>
                    <strong>Enter a location</strong> in the search box below.
                  </p>
                </div>

                <div v-if="infoPage==2 && !narrow">
                  <p>
                    <strong><span class="highlighted bg-red">Red line</span></strong> + <span class="highlighted bg-grey text-black">Grey  band</span>: path of total eclipse on map
                  </p>
                  <p class="mt-2">
                    <strong>{{ touchscreen ? "Tap" : "Click" }}</strong><v-icon icon="mdi-sun-clock" size="large" class="bullet-icon"></v-icon> to see detailed eclipse times
                  </p>
                  <p v-if="getMyLocation">
                    <strong>{{ touchscreen ? "Tap" : "Click" }}</strong>
                    <font-awesome-icon icon="location-crosshairs" class="bullet-icon"/>
                    to view eclipse from <strong>My Location</strong> (Location services must be enabled on device)
                  </p>
                  <p>
                    <strong>{{ touchscreen ? "Tap" : "Click" }}</strong> <font-awesome-icon icon="share-nodes" class="bullet-icon"/> to copy url to share a location
                  </p>
                </div>
              </span>
            </div>
            <div class="d-flex justify-end" id="info-text-button" v-if="learnerPath=='Location' && !narrow">
              <v-btn
                class="mr-2 mb-2"
                v-if="infoPage==1"
                density="compact"
                hide-details
                :color="accentColor"
                @click="infoPage++"
                @keyup.enter="infoPage++"
                elevation="0"
                >
                More
              </v-btn>
              <v-btn
                v-if="infoPage==2"
                class="mr-2 mb-2"
                density="compact"
                :color="accentColor"
                @click="infoPage--"
                @keyup.enter="infoPage--"
                elevation="0"
                >
                Back
              </v-btn>
            </div>

            <!-- Clouds Path -->
            <div class="instructions-text" v-if="learnerPath=='Clouds'">
              <span class="description">
                <div class=".d-flex">
                  <div>
                    This map shows historical cloud cover data for the week of August 12 for the years 2003&#8211;2023 from <a href="https://modis.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">MODIS</a> on NASA's Aqua satellite.
                    {{ touchscreen ? "Tap" : "Click" }} the map to display the <define-term term="median" definition="For <strong>half</strong> of the years from 2003–2023 on August 12, the cloud cover amount was <strong>less</strong> than the median value. For the other <strong>half</strong> of the years, the cloud cover was <strong>more</strong> than the median value."/> cloud coverage for a particular location (within about 100 km). 
                  </div>
                  <div>
                    <cloud-cover
                      :cloud-cover="selectedLocationCloudCover"
                      @cloudIcon="cloudIcon = $event"
                    />
                  </div>
                  
                </div>
              </span>
            </div>
            
            
          </div>
        </div>
      <!-- </toggle-content> -->
        <div id="button-row" class="non-map-row">
          <!-- <v-col> -->
            <div id="top-container-buttons">
              <icon-button
                :model-value="learnerPath == 'Location'" 
                fa-icon="location-dot"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="'Choose any viewing location'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Location'}"
              ></icon-button>
              <icon-button
                :model-value="learnerPath == 'Clouds'"
                fa-icon="cloud-sun"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="'View historical cloud coverage'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Clouds'}"
              ></icon-button>
              
              <icon-button
                v-model="showInfoSheet"
                fa-icon="book-open"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showInfoSheet ? null : 'More on Eclipses'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
              ></icon-button>
              <icon-button
                v-model="showWWTGuideSheet"
                fa-icon="circle-info"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showWWTGuideSheet ? null : 'User Guide'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
              ></icon-button>
            </div>
          <!-- </v-col> -->
        </div>
      </div>
      <div id="map-column">
      <v-hover v-slot="{isHovering, props}">
        <v-btn v-bind="props" v-if="false &&!isHovering && !smAndUp" color="blue" :width="'100%'">Tap here to reveal map</v-btn>
        <v-slide-y-transition
          :disabled="smAndUp"
        >
          <div 
            :class="['']"
            id="map-container" :data-before-text="eclipsePredictionText">
            
            <div 
              v-if="learnerPath === 'Location' && showEclipsePredictionTextBanner" 
              id="map-banner" 
              class="show-after"
              >
              <span style="font-size: 0.75em" v-if="showEclipsePredictionText">
                {{ eclipsePredictionText }}
              </span>
              <span v-else>
                {{ touchscreen ? "Tap" : "Click" }} <v-icon style="padding: 2px; border-radius:3px; background-color:#ddd;" class="elevation-2" @click="showEclipsePredictionSheet = true; showEclipsePredictionText = true">mdi-sun-clock</v-icon> to see eclipse predictions
              </span>
              <span class="banner-close" @click="showEclipsePredictionTextBanner = false">
                <v-icon>mdi-close</v-icon>
              </span>
            </div>
            
            <!-- modelValue = false, starts with it closed, use stay-open to keep it open -->
            <location-search
              v-model="searchOpen"
              :class="['location-search-overmap', learnerPath === 'Clouds' ? 'overmap-budge' : '', showNewMobileUI ? '' : 'overmap-low']"
              v-if="narrow"
              small
              buttonSize="xl"
              :search-provider="geocodingInfoForSearch"
              :accentColor="accentColor"
              @set-location="setLocationFromSearchFeature"
              @error="searchErrorMessage = $event"
            >
            </location-search>
            <icon-button
            v-if="getMyLocation && narrow"
            :id="'my-location-overmap' + (learnerPath === 'Clouds' ? '-budge' : '')"
            fa-icon="location-crosshairs"
            fa-size="2xl"
            :color="myLocationColor"
            :focus-color="myLocationColor"
            :box-shadow="false"
            :tooltip-text="myLocationToolTip"
            :show-tooltip="!mobile"
            @update:modelValue="(value: boolean) => {
              if(value) {
                ($refs.geolocation as any).getLocation();
                showMyLocationDialog = true;
                learnerPath = 'Location';
              }
              else {
                console.log('geolocation button pressed = false');
              }

            }"
          ></icon-button>
            <icon-button
              v-if="narrow"
              id="eclipse-details-overmap"
              md-icon="sun-clock"
              md-size="24"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="View eclipse timing details"
              tooltip-location="start"
              @activate="() => {
                showEclipsePredictionSheet = true;
                if (!showEclipsePredictionText) {
                  showEclipsePredictionTextBanner = true;
                }
                showEclipsePredictionText = true;
              }"
              >
            </icon-button>
            <!-- :places="places" -->
            <location-selector
              :model-value="locationDeg"
              @update:modelValue="updateLocationFromMap"
              :place-circle-options="placeCircleOptions"
              :detect-location="false"
              :map-options="(['Clouds', 'CloudDetail'].includes(learnerPath)) ? userSelectedMapOptions : initialMapOptions"
              :selected-circle-options="selectedCircleOptions"
              :show-cloud-cover="['Clouds', 'CloudDetail'].includes(learnerPath) && cloudCoverData !== null"
              class="leaflet-map"
              :geo-json-files="geojson"
              :selected-cloud-cover="selectedCloudCoverData"
              :cloud-cover-opacity-function="(v: number) => v"
              :rectangle-degrees="rectangleDegrees"
            ></location-selector>
              <color-bar
                v-if="learnerPath === 'Clouds'"
                label="Historical Cloud Cover %"
                :cmap="cloudColorMap"
                />
          </div>
        </v-slide-y-transition>
      </v-hover>
    </div>
  </v-container>
  
  <v-dialog
    id="video-container"
    v-model="showVideoSheet"
    transition="slide-y-transition"
    close-on-back
    fullscreen
  >
    <div class="video-wrapper">
      <font-awesome-icon
        id="video-close-icon"
        class="close-icon"
        icon="times"
        size="lg"
        @click="showVideoSheet = false"
        @keyup.enter="showVideoSheet = false"
        tabindex="0"
      ></font-awesome-icon>
      <video
        controls
        id="info-video"
      >
        <source src="./assets/video.mp4" type="video/mp4">
      </video>
    </div>
  </v-dialog>
  

    <v-dialog
      scrim="false"
      transition="slide-y-transition"
      v-model="showInfoSheet" 
      class='bottom-sheet'
      id="text-bottom-sheet"
      :style="cssVars"
    >
      <v-card
        class="bottom-sheet-card">
        <v-card-title tabindex="0"><h3 class="v-btn tab-title">Information</h3></v-card-title>
          <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          :icon="`square-xmark`"
          size="xl"
          @click="showInfoSheet = false"
          @keyup.enter="showInfoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-container id="learn-more-content">
                <div id="info-text-box">

                  <div id="main-info-text">
                    <p>
                    On August 12, 2026, Europe will be treated to an awe-inspiring total eclipse. 
                    </p>
                    <p>
                    This interactive lets you explore the August total eclipse from different locations. 
                    </p>
                    <p id="safety-warning">
                      SAFETY FIRST: NEVER look directly at the Sun without proper eye protection.
                    </p>
                  </div>  
                  <div id="FAQ">
                    <details>
                      <summary>
                        What causes Solar Eclipses?
                      </summary>
                      <p>
                        A solar eclipse happens when the Moon passes between the Earth and the Sun and blocks the Sun from our view. Partial eclipses occur about every 6 months, somewhere on the Earth. 
                      </p>
                    </details>
                    
                    <details>
                      <summary> Total? Annular? What is the difference?</summary>
                      <p>
                        During a <strong>total eclipse</strong>, the Moon covers the entire face of the Sun. Because the Moon doesn't orbit the Earth in a perfect circle, sometimes it is farther away from Earth and appears smaller. When this happens, the Moon doesn't cover the entire face of the Sun. During the eclipse we can still see a bright ring of light around the Moon, sometimes called the "Ring of Fire." This is called an <strong>annular Eclipse</strong>.
                      </p>
                    </details>

                    <details>
                      <summary> What is the wispy haze around the Sun during a Total Solar Eclipse?</summary>
                      <p>
                        The <strong>corona</strong> is the outermost layer of the Sun's atmosphere, and it is made up of extremely hot, glowing gas. We usually can't see the corona because the Sun's surface shines so much more brightly. During a total solar eclipse, the Moon blocks light from the surface of the Sun, making it possible to see the ethereally beautiful corona.
                      </p>
                    </details>
                    
                    <details> 
                      <summary> Why can only some places see the eclipse?</summary>
                      <p>
                        An eclipse is caused by the Moon casting a shadow on the Earth. People who are directly behind the Moon will see an annular or total eclipse. As the Moon moves in its orbit around Earth, and as Earth rotates, the location of the shadow will move, sweeping out a path across the surface of the Earth. For a larger number of people who are not directly behind the moon, a smaller amount of the Sun will be blocked, causing a partial eclipse. Even further outside the shadow the Sun will not be blocked at all, and there will be no eclipse visible.
                      </p>
                      <p> 
                        The animated figure shows that the Moon's shadow on Earth has two distinct regions. The darker part of the shadow is directly behind the Moon, where people will experience an annular or total eclipse. The lighter part of the shadow falls where people on Earth will see a partial solar eclipse.
                      </p> 
                    </details>

                    <details> 
                      <summary>How precise are location and timing predications in this Data Story?</summary>
                      <p>
                        You may notice some discrepancies in the reported eclipse percentages or with eclipse start and end times compared with other predictions. This is caused by limitations in precision for the calculations used to display the locations and sizes of the Sun and Moon on your screen. Totality timing predictions in this Data Story should be accurate to within about 15 seconds.
                      </p> 
                    </details>
                    
                    <details>
                      <summary>Where can I learn more?</summary>
                      <p>
                        Check out
                        <ul>
                          <li>
                            Infiniscope's Kingdom in Peril lessons on eclipses, available in <a href="https://infiniscope.org/collection/3" target="_blank" rel="noopener noreferrer">English</a> and <a href="https://infiniscope.org/collection/6" target="_blank" rel="noopener noreferrer">Spanish</a>
                          </li>
                          <li>
                            Fiske Planetarium's <a href="https://www.colorado.edu/fiske/projects/science-through-shadows" target="_blank" rel="noopener noreferrer">Science Through Shadows</a> videos
                          </li>
                        </ul>
                      </p>
                    </details>
                  </div>
                </div>
              <figure>
                <!-- <v-img src="https://www.nasa.gov/sites/default/files/thumbnails/image/tsis_eclipse-1.gif"></v-img> -->
                <gif-play-pause startPaused :gif='require("./assets/eclipse.gif")' :still='require("./assets/eclipse_static.gif")' alt="Animated schematic of a solar eclipse showing how the Moon moves between the Sun and Earth."/>
                <figcaption>Image credit: NASA Goddard / Katy Mersmann</figcaption>
                <div class="disclaimer">Not to scale</div>
              </figure>
            </v-container>
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>
    
    <v-dialog
      scrim="false"
      transition="slide-y-transition"
      v-model="showWWTGuideSheet" 
      class="bottom-sheet"
      id="wwt-guide-sheet"
      :style="cssVars"
    >
      <v-card class="bottom-sheet-card">
        <v-card-title tabindex="0"><h3 class="v-btn tab-title">User Guide</h3></v-card-title>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          :icon="`square-xmark`"
          size="xl"
          @click="showWWTGuideSheet = false"
          @keyup.enter="showWWTGuideSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-container  id="user-guide">
              <p style="font-size: calc(1.1 * var(--default-font-size))" class="mb-5">
                This Cosmic Data Story allows you to display the August 12, 2026 Total Solar Eclipse from any location. 
              </p>
              <v-row align="center">
              <v-col cols="4">
                  <v-chip
                    label
                    outlined
                  >
                    Pan
                  </v-chip>
                </v-col>
                <v-col cols="8" class="pt-1">
                  <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? "" : "or" }}  <strong>{{ touchscreen ? "" : "W-A-S-D" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col cols="4">
                  <v-chip
                    label
                    outlined
                  >
                    Zoom
                  </v-chip>
                </v-col>
                <v-col cols="8" class="pt-1">
                  <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? "" : "or" }} <strong>{{ touchscreen ? "" : "I-O" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div
                      style="min-height: 120px;"
                  >                   
                    <h4 class="user-guide-header">Time Controls:</h4>
                    <p  class="mb-3">(Bottom-left of the screen)</p>
                    <p>
                      By default, time is moving forward at 500x the real speed. Time slows down to 10x the real speed as the eclipse approaches totality.
                    </p>
                    <ul class="text-list">
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="angles-left"
                              size="lg" 
                            ></font-awesome-icon>
                        to reverse time, or to increase reverse speed by 10x if time was already reversed. 
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                          class="bullet-icon"
                          icon="play"
                          size="lg" 
                        ></font-awesome-icon>/
                        <font-awesome-icon
                          class="bullet-icon"
                          icon="pause"
                          size="lg" 
                        ></font-awesome-icon>
                        to play or pause time. 
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                          class="bullet-icon"
                          icon="angles-right"
                          size="lg" 
                        ></font-awesome-icon>
                        to increase speed by 10x, or to move time forward if time was reversed.                        
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="rotate"
                              size="lg" 
                            ></font-awesome-icon>
                        to reset starting time and speed. 
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="gauge-high"
                              size="lg" 
                            ></font-awesome-icon>
                        to open more speed controls. 
                      </li>
                        <ul>
                          <li class="ml-5">
                            {{ touchscreen ? "Tap" : "Click" }} 
                            <v-icon
                              class="bullet-icon"
                              icon="mdi-step-forward-2"
                              size="medium">
                            </v-icon>
                            or
                            <v-icon
                              class="bullet-icon"
                              icon="mdi-step-backward-2"
                              size="medium">
                            </v-icon>
                            to move time forward and backward.
                          </li>
                          <li class="ml-5">
                            Use the slider to fine-tune desired speed.
                          </li>
                        </ul>
                      <li>
                        Drag <v-icon
                          class="bullet-icon"
                          icon="mdi-circle"
                          size="medium" 
                        ></v-icon> along the main slider to move to any time.
                      </li>
                    </ul>

                    <v-divider thickness="2px" class="solid-divider"></v-divider>
                    
                    <h4 class="user-guide-header">Viewing Mode:</h4>
                    <p  class="mb-3">(Upper-right of the screen)</p>
                    <ul class="text-list">
                      <li>
                        <span 
                        style="color: blue; background-color: white;
                        padding-inline: 0.7em;
                        border-radius: 20px;
                        font-weight: bold ">Selected Location</span> The currently selected location.  
                      </li>
                      <li class="mb-2">
                        <span 
                        style="color: blue; background-color: white;
                        padding-inline: 0.7em;
                        border-radius: 20px;
                        font-weight: bold ">Date/Time</span> The date and time being displayed by WorldWide Telescopse
                      </li>
                      <li v-if="showNewMobileUI">
                        <span 
                          style="color: blue; background-color: white;
                          padding-inline: 0.7em;
                          border-radius: 20px;
                          font-weight: bold ">Eclipsed:
                        </span> The fraction of the Sun that is eclipsed in the currenty view (for the selected time and location).
                      </li>
                      <li class="switch-bullets">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOn"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          true-icon="mdi-white-balance-sunny"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Track Sun:</span> Camera follows the Sun.
                      </li>
                      <li class="switch-bullets mb-5">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOff"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          false-icon="mdi-image"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Don't Track Sun:</span> Camera stays fixed and shows motion of Sun (and Moon) against the sky.
                      </li>
                    </ul>

                    <v-divider thickness="2px" class="solid-divider"></v-divider>
                    
                    <h4 class="user-guide-header">Display Options:</h4>
                    <p  class="mb-3">(Bottom-right of the screen)</p>
                    <ul class="text-list">
                      <li class="mb-2" v-if="showNewMobileUI">
                        {{ touchscreen ? "Tap" : "Click" }}
                        <font-awesome-icon
                          class="bullet-icon"
                          icon="book-open"
                          size="lg" 
                        ></font-awesome-icon> to open <span class="user-guide-emphasis-white">Information Guide</span> on why eclipses happen and more.
                      </li>
                      <li class="mb-2">
                        {{ touchscreen ? "Tap" : "Click" }}
                        <v-icon
                          class="bullet-icon"
                          icon="mdi-sun-clock"
                          size="large">
                        </v-icon> to display detailed <span class="user-guide-emphasis-white">eclipse timing</span> predictions for your selected location.
                      </li>
                    </ul>
                          
                    <v-divider thickness="2px" class="solid-divider"></v-divider>

                    <h4 class="user-guide-header">Location <span v-if="showNewMobileUI">and other</span> Options:</h4>
                    <p  class="mb-3">(Top-left of the screen)</p>
                    <ul class="text-list">
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="magnifying-glass"
                              size="lg" 
                            ></font-awesome-icon> to search for a specific location name.
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }}
                        <font-awesome-icon
                          class="bullet-icon"
                          icon="location-crosshairs"
                          size="lg" 
                        ></font-awesome-icon> to view from <strong>My Location</strong>. (If icon is grayed out, consult your device's user guide to enable location services. This feature works most reliably on Chrome and might not be available on every browser+operating system combination.)                    
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="share-nodes"
                              size="lg" 
                            ></font-awesome-icon> to copy <strong>share-url</strong> for a specific location.
                      </li>
                    </ul>
                    <p v-if="showNewMobileUI" class="mt-3 mb-1">
                      Tap <font-awesome-icon
                          class="bullet-icon"
                          icon="gear"
                          size="lg" 
                        ></font-awesome-icon> to access more options:
                    </p>     
                    <ul>
                      <li v-if="showNewMobileUI">
                        <span class="user-guide-emphasis-white">Center Sun:</span> Recenter view on Sun.
                      </li>
                      <li v-if="showNewMobileUI">
                        <span class="user-guide-emphasis-white">Sky Grid:</span> Display altitude/azimuth grid with cardinal directions.
                      </li>
                      <li v-if="showNewMobileUI">
                        <span class="user-guide-emphasis-white">Horizon/Daytime Sky:</span> Display a virtual "ground" that delineates where the Sun rises and sets. Show a blue sky when the Sun is above the horizon.                     
                      </li>
                      <li v-if="showNewMobileUI">
                        <span class="user-guide-emphasis-white">Visible Moon:</span> Solar Eclipses occur during a New Moon, when the Moon is not normally visible in the sky. This option makes it easier to see the Moon against the sky.                     
                      </li>
                      <li v-if="showNewMobileUI">
                        <span class="user-guide-emphasis-white">Detailed Interface:</span> Switch to original mobile interface. (Uncheck box to use new streamlined interface)                               
                      </li>                  
                    </ul>

                  </div>
                          
                  <v-divider thickness="2px" class="solid-divider"></v-divider>
                  
                </v-col>
              </v-row>
              <div id="text-credits">
                <h3>Credits:</h3>
                <p class="mt-2">Atmospheric Physicist <a href="https://www.cfa.harvard.edu/people/caroline-nowlan" target="_blank" rel="noopener noreferrer">Caroline Nowlan</a> provided valuable guidance on interpreting the <a href="https://neo.gsfc.nasa.gov/view.php?datasetId=MYDAL2_E_CLD_FR&date=2023-04-07"  target="_blank" rel="noopener noreferrer">MODIS Cloud Cover</a> data.</p> 

                <p class="mt-3">The path of totality data are from <a href="https://svs.gsfc.nasa.gov/5123" target="_blank" rel="noopener noreferrer">NASA's Science Visualization Studio</a>.</p>

                <p class="mt-3">Eclipse Timing Predictions are by <a href="https://eclipse.gsfc.nasa.gov/JSEX/JSEX-NA.html" target="_blank" rel="noopener noreferrer">Fred Espenak and Chris O'Byrne</a> (NASA's GSFC). <em>Adapted for TypeScript by CosmicDS Team</em></p>
            
                <p class="mt-3">Image of Sun is courtesy of NASA/SDO and the AIA, EVE, and HMI science teams.</p>

                <p class="my-3">This Cosmic Data Story is powered by WorldWide Telescope (WWT).</p>  

                <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Team:</h4> 
                
                John Lewis<br>
                Jon Carifio<br>
                Pat Udomprasert<br>
                Jack Hayes<br>
                Alyssa Goodman<br>
                Mary Dussault<br>
                Harry Houghton<br>
                Anna Nolin<br>
                Evaluator: Sue Sunbury<br>
                
                <h4><a href="https://www.worldwidetelescope.org/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a> Team:</h4>
                Peter Williams<br>
                A. David Weigel<br>
                Jon Carifio<br>
              </div>
              
              <funding-acknowledgment/>

            </v-container>              
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>

  
  <div v-show="!showGuidedContent && showEclipsePredictionTextBanner" class="user-banner">
    <span class="banner-text" v-if="showEclipsePredictionText">
      {{ eclipsePredictionText }}
    </span>
    <span class="banner-text" v-else>
      {{ touchscreen ? "Tap" : "Click" }} <v-icon>mdi-sun-clock</v-icon> to see eclipse predictions
    </span>
    <span class="banner-close" @click="showEclipsePredictionTextBanner = false">
      <v-icon>mdi-close</v-icon>
    </span>
  </div>
  
  <div
    id="main-content"
  > 
    <div id="center-page-banner" v-if="(sunPosition.altRad < -.25 * Math.PI/180)">
      <p>
        The Sun has {{ sunPosition.azRad < Math.PI ? 'not risen yet' : 'set' }}
      </p>
    </div>
    <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
    ></WorldWideTelescope>
    <div>
      <div id="left-buttons-wrapper" :class="[!showGuidedContent ?'budge' : '']">
        <div id='geocoding-row' class="d-flex align-center ga-1">
          <location-search
            class="location-search-overwwt"
            v-model="searchOpen"
            :search-provider="geocodingInfoForSearch"
            :accentColor="accentColor"
            @set-location="setLocationFromSearchFeature"
            @error="searchErrorMessage = $event"
            small
            buttonSize="lg"
          />
        </div>
        <div>
          <icon-button
            v-if="getMyLocation"
            class="geolocation-button"
            id="my-location"
            fa-icon="location-crosshairs"
            :color="myLocationColor"
            :focus-color="myLocationColor"
            :box-shadow="false"
            :tooltip-text="myLocationToolTip"
            :show-tooltip="!mobile"
            @update:modelValue="(value: boolean) => {
              if(value) {
                ($refs.geolocation as any).getLocation();
                showMyLocationDialog = true;
                learnerPath = 'Location';
              }
              else {
                console.log('geolocation button pressed = false');
              }

            }"
            faSize="lg"
          ></icon-button>
        
          <div id="location-progress" :class="[!showGuidedContent ?'budge' : '']">
            <geolocation-button
              :color="accentColor"
              :show-text-progress = "true"
              hide-button
              show-progress-circle
              ref="geolocation"
              @geolocation="(loc: GeolocationCoordinates) => { 
                myLocation = {
                  latitudeDeg: loc.latitude, 
                  longitudeDeg: loc.longitude
                };
                showMyLocationDialog = false;
                
                if (myLocation.latitudeDeg !== locationDeg.latitudeDeg || myLocation.longitudeDeg !== locationDeg.longitudeDeg) {
                  locationDeg = myLocation;
                  $nextTick(() => {
                    updateSelectedLocationText();
                  });
                }
              }"
              @error="(error: GeolocationPositionError) => { 
                $notify({
                  group: 'geolocation-error',
                  title: 'Error',
                  text: error.message,
                  type: 'error',
                }); 
                if (error.code === 1) {
                  geolocationPermission = 'denied';
                }
                console.log(error);
              }"
              @permission="(p: PermissionState) => {
                geolocationPermission = p;
                // we're always gonna show the button,
                // just leaving this if we wanna change
                if (p == 'granted') {
                  getMyLocation = true;
                } else if (p == 'prompt') {
                  getMyLocation = true;
                } else {
                  getMyLocation = true;
                }
              }"
            ></geolocation-button>
          </div>
        </div>
        
        <icon-button
          id="share"
          fa-icon="share-nodes"
          :color="accentColor"
          :focus-color="accentColor"
          :box-shadow="false"
          tooltip-text="Share view of this location"
          :show-tooltip="!mobile"
          @activate="copyShareURL"
          faSize="lg"
        ></icon-button>
        
        <div
          id="controls"
          class="control-icon-wrapper"
          v-if="showNewMobileUI"
        >
          <div id="controls-top-row">
            <font-awesome-icon
              size="lg"
              :color="accentColor"
              :icon="showControls ? `chevron-down` : `gear`"
              @click="showControls = !showControls"
              @keyup.enter="showControls = !showControls"
              tabindex="0"
            /> 
          </div>

          <div v-if="showControls" id="control-checkboxes">
            <v-checkbox
              :color="accentColor"
              v-model="sunCenteredTracking"
              @change="centerSun()"
              label="Center Sun"
              :disabled="sunCenteredTracking"
              hide-details 
            />
            <v-checkbox
              :color="accentColor"
              v-model="showAltAzGrid"
              @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Sky Grid"
              hide-details 
            />
            <v-checkbox
              :color="accentColor"
              v-model="showHorizon"
              @keyup.enter="showHorizon = !showHorizon"
              label="Horizon/Daytime Sky"
              hide-details
            />
            <v-checkbox
              :color="accentColor"
              v-model="useRegularMoon"
              @keyup.enter="useRegularMoon = !useRegularMoon"
              label="Visible Moon"
              hide-details
            />    
            <v-checkbox
              :color="accentColor"
              v-model="showEclipsePredictionTextBanner"
              @keyup.enter="showEclipsePredictionTextBanner = !showEclipsePredictionTextBanner"
              label="Eclipse Timing"
              hide-details 
            />  
            <v-checkbox
              v-show="narrow"
              :color="accentColor"
              v-model="showOldMobileUI"
              @keyup.enter="showOldMobileUI = !showOldMobileUI;"
              label="Detailed Interface"
              hide-details
            ></v-checkbox>            
          </div>
      </div>
    </div>      
      <!-- <div id="mobile-zoom-control"> -->
        <!-- {{ Math.round(Math.pow(10, userZoom)*100)/100 }} -->
        <!-- <div class="slider-padding">
          <v-icon>mdi-magnify-plus</v-icon>
        </div>
        <vue-slider 
          v-model="userZoom"
          direction="ttb"
          :min="1"
          :max="Math.round(Math.log10(360)*100)/100"
          :interval=".01"
          :color="accentColor"
          :tooltip="'none'"
          :duration="0"
          :height="wwtContentHeight ? `${0.5 * wwtContentHeight}px` : '200px'"
          :process-style="{ backgroundColor: 'rgb(255 193 203)' }"
          :dot-style="{ backgroundColor: accentColor, borderColor: 'black'}"
          ></vue-slider>
        <div class="slider-padding">
          <v-icon>mdi-magnify-minus</v-icon>
        </div>
      </div> -->
        <!-- <v-dialog
          scrim="false"
          v-model="showMyLocationDialog"
          max-width="400px"
          id="mylocation-popup-dialog"
        >
          <v-card>
            <v-card-text>
              Fetching your location...
            </v-card-text>
          </v-card>
        </v-dialog> -->
    </div>


    
    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      :style="cssVars"
      id="splash-overlay"
      :class="[showNewMobileUI ? 'new-mobile-ui' : '']"
    >
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
        <div
            id="first-splash-row"
        >
          <div
            id="close-splash-button"
            @click="closeSplashScreen"
            >&times;</div>
          <div id="splash-screen-text">
            <p>See how the </p>
            <p class="highlight">August 12, 2026</p> 
            <p class="highlight">TOTAL Solar Eclipse</p>
            <p>will look from any 
            <span class="highlight">location</span>
            </p>
          </div>
        </div>

        <div>
          <v-btn
            class="splash-get-started"
            @click="closeSplashScreen"
            :color="accentColor"
            :density="xSmallSize ? 'compact' : 'default'"
            size="x-large"
            variant="elevated"
            rounded="lg"
          >
            Get Started
          </v-btn>
        </div>

        <div v-if="narrow">
          <p class="splash-small-text">
            <a 
              href="#" 
              @click.prevent="showNewMobileUI = !showNewMobileUI">Switch</a> to {{ showNewMobileUI ? "detailed" : "new streamlined" }} interface
          </p>
        </div>
        <div v-else>
          <p class="splash-small-text">
            <v-icon icon="mdi-creation" size="small" class="bullet-icon"></v-icon> New! NOW button, active starting at 6:40am EDT
          </p>
        </div>

        <div id="splash-screen-acknowledgements">
          <div>
            <img
              src="./assets/eclipseds.png"
              alt="Cosmic Data Stories Eclipse logo"
              class="eclipse-ds-logo" 
              />
          </div>
          Brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
        </div>
      </div>
    </v-overlay>

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>

  <!-- Opening Dialog Sequence -->
    <v-overlay
      v-if="narrow"
      v-model="inIntro"
      opacity="1"
      :scrim="false"
      :close-on-content-click="true"
      >
      <div id="instruction-overlay">
        <div id="overlay-close">
          <v-icon
            class="overlay-close-icon"
            icon="mdi-close-box"
            color="gray"
            @click="inIntro = !inIntro"
            @keyup.enter="inIntro = !inIntro"
            tabindex="0"
          ></v-icon>
        </div>
        <div class="inst-quad top-left">
          <div class="inst-arrow"><v-icon  class="the-arrow" :color="accentColor" :size="Math.min($vuetify.display.width*0.16,$vuetify.display.height*0.16)">mdi-arrow-up-bold</v-icon></div>
          <div class="inst-text">
            Set location + more
          </div>
        </div>
        <div class="inst-quad top-right">
          <div class="inst-arrow"><v-icon  class="the-arrow" :color="accentColor" :size="Math.min($vuetify.display.width*0.16,$vuetify.display.height*0.16)">mdi-arrow-up-bold</v-icon></div>
          <div class="inst-text">
            Where, when + how much
          </div>
        </div>
        <div class="inst-quad bottom-left">
          <div class="inst-arrow"><v-icon  class="the-arrow" :color="accentColor" :size="Math.min($vuetify.display.width*0.16,$vuetify.display.height*0.16)">mdi-arrow-up-bold</v-icon></div>
          <div class="inst-text">
            New! Set time to "Now," or control time yourself!
          </div>
        </div>
        <div class="inst-quad bottom-right">
          <div class="inst-arrow"><v-icon  class="the-arrow" :color="accentColor" :size="Math.min($vuetify.display.width*0.16,$vuetify.display.height*0.16)">mdi-arrow-up-bold</v-icon></div>
          <div class="inst-text">
            Tell me what will happen and when
          </div>
        </div>
        <!-- <div id="instructions-close-button">
          <v-icon 
            :size="Math.max(0.1 * $vuetify.display.width, 20)" 
            @click="inIntro = !inIntro"
            icon="mdi-gesture-tap-button"
            >
          </v-icon>
          Tap to close
        </div> -->
      </div>
    </v-overlay>

    <v-dialog
      v-if="!narrow"
      v-model="inIntro"
      :style="cssVars"
      :scrim="false"
      :persistent="false"
      >
      <div v-if="inIntro" id="introduction-overlay" class="elevation-10">
        <v-window v-model="introSlide">
          <template v-slot:additional>
            <div id="intro-window-close-button">
            <font-awesome-icon
              size="xl"
              class="ma-1"
              color="#b3d5e6"
              icon='square-xmark'
              @click="inIntro = !inIntro"
              @keyup.enter="inIntro = !inIntro"
              tabindex="0"
              tooltip-location="start"
            /> 
          </div>
          </template>
          
          
          <v-window-item :value="2">
            <div class="intro-text mb-3">
              <div v-if="xSmallSize" class="mb-3">
                <p class="mb-3">
                Access these features in  
                </p> 
                <span class="px-2 py-1 my-2 mr-1" style="border: 1px solid #eac402; border-radius: 1em; color:#eac402; white-space: nowrap">Map & Weather</span>
              </div>
              <p v-else class="mb-3">
                In this interactive page you can:
              </p>
              <ul>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="location-dot" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>Select any location</strong> around the world. See and share how the eclipse would look from there.
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="cloud-sun" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>View historical cloud data</strong> for the week of August 12th from 2003&#8211;2023. 
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="book-open" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>Learn more</strong> about solar eclipses. 
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="circle-info" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Access <strong>User Guide</strong> on how to navigate this app. 
                </v-list-item>
              </ul>
            </div>
          </v-window-item>
        </v-window>
      

        <div id="intro-bottom-controls">
          <div>
          <v-btn
            id="intro-next-button"
            :color="accentColor"
            @click="introSlide++"
            @keyup.enter="introSlide++"
            elevation="0"
            >
            Get Started
          </v-btn>
        </div>
      </div>
      </div>
    </v-dialog>
    
  
  <div id="top-wwt-content">
    <!-- <p> in total eclipse {{ locationInTotality }}</p> -->
      <div id="location-date-display">
        <v-chip 
          :prepend-icon="cloudIcon"
          variant="outlined"
          size="small"
          elevation="3"
          :text="selectedLocationText"
          @click="() => {
            searchOpen = true; 
            learnerPath = 'Location'
            }"
        > </v-chip>
        <v-chip 
          :prepend-icon="smallSize ? `` : `mdi-clock`"
          variant="outlined"
          size="small"
          elevation="1"
          :text="selectedLocaledTimeDateString"
        > </v-chip>
        <v-chip 
          v-if="showNewMobileUI"
          :prepend-icon="smallSize ? `` : `mdi-sun-angle`"
          variant="outlined"
          elevation="1"
          size="small"
          :text="percentEclipsedText"
        > </v-chip>
      </div>
      <div id="top-switches">
        <div id="track-sun-switch"> 
          <hover-tooltip
              location="left"
              :disabled="mobile"
            >
              <template v-slot:target>
                <v-switch
                  inset
                  hide-details
                  v-model="toggleTrackSun"
                  :ripple="false"
                  :color="accentColor"
                  true-icon="mdi-white-balance-sunny"
                  false-icon="mdi-image"
                  @keyup.enter="toggleTrackSun = !toggleTrackSun"
                  tabindex="0"
                >
                </v-switch>
            </template>
            {{ toggleTrackSun ? "Stop Tracking Sun" : 'Start Tracking Sun' }}
          </hover-tooltip>
        </div>
      </div>
    </div>
    
    <div class="bottom-content">
     
      <v-dialog
        v-model="showEclipsePredictionSheet"
        max-width="fit-content"
        transition="slide-y-transition"
        id="eclipse-prediction-sheet"
        >
        <v-card>
          <v-card-text>
            <font-awesome-icon
                style="position:absolute;right:12px;cursor:pointer;padding:1em;margin:-1em"
                icon="square-xmark"
                size="xl"
                @click="showEclipsePredictionSheet = false"
                @keyup.enter="showEclipsePredictionSheet = false"
                tabindex="0"
              ></font-awesome-icon>
            <eclipse-timer show-timer :prediction="eclipsePrediction" :timezone="selectedTimezone" :color="accentColor" :location="selectedLocationText"/>
          </v-card-text>
        </v-card>
      </v-dialog>
            
      <icon-button
        v-if="showNewMobileUI"
        v-model="showInfoSheet"
        fa-icon="book-open"
        fa-size="lg"
        :color="accentColor"
        :focus-color="accentColor"
        :tooltip-text="showInfoSheet ? null : 'More on Eclipses'"
        :tooltip-location="'left'"
        :show-tooltip="!mobile"
        :box-shadow="false"
      ></icon-button>
      
      <icon-button
        id="eclipse-details-button"
        md-icon="sun-clock"
        :md-size="showNewMobileUI ? '16' : '24'"
        :color="accentColor"
        :focus-color="accentColor"
        tooltip-text="View eclipse timing details"
        tooltip-location="start"
        @activate="() => {
          showEclipsePredictionSheet = true;
          if (!showEclipsePredictionText) {
            showEclipsePredictionTextBanner = true;
          }
          showEclipsePredictionText = true;
        }"
        >
      </icon-button>


      
      <div id="eclipse-percent-chip">
        <v-btn
          id="set-time-now-button"
          variant="outlined"
          rounded="xl"
          :disabled="nowOutsideTimeRange"
          :color="nowOutsideTimeRange ? 'gray' : '#eac402'"
          @click="() => {
            selectedTime = Math.max(minTime, Math.min(maxTime, Date.now()));
            playbackRate=1;
            playing=true;
            }"
        >
          Now
        </v-btn>
      </div>
      
      <div id="video-icon">
        <icon-button
          v-model="showVideoSheet"
          id="video-icon"
          fa-icon="video"
          fa-size="lg"
          :color="accentColor"
          tooltip-text="Video guide"
          tooltip-location="start"
          :tooltip-offset="smallSize ? 0 : '10px'"
        ></icon-button>
      </div>
      <div id="tools">
        <span class="tool-container">
          <div style="position: relative">
            <div id="speed-control">
              <icon-button
                id="reverse-speed"
                :fa-icon="'angles-left'"
                @activate="() => {
                      reversePlaybackRate();
                      // playing = true;
                    }"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="playbackRate < 0 ? 'Reverse Faster' : 'Reverse'"
                tooltip-location="top"
                tooltip-offset="5px"
                faSize="1x"
                :show-tooltip="!mobile"
              ></icon-button>
              <icon-button
                id="play-pause-icon"
                :fa-icon="!(playing) ? 'play' : 'pause'"
                @activate="() => {
                  playing = !(playing);
                }"
                :color="accentColor"
                :focus-color="accentColor"
                tooltip-text="Play/Pause"
                tooltip-location="top"
                tooltip-offset="5px"
                faSize="1x"
                :show-tooltip="!mobile"
              ></icon-button>
              <icon-button
                id="forward-speed"
                :fa-icon="'angles-right'"
                @activate="() => {
                      increasePlaybackRate();
                      // playing = true;
                    }"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="playbackRate > 0 ? 'Faster' : 'Forward'"
                tooltip-location="top"
                tooltip-offset="5px"
                faSize="1x"
                :show-tooltip="!mobile"
              ></icon-button>
              <icon-button
                id="reset"
                :fa-icon="'rotate'"
                @activate="() => {
                  selectedTime = (new Date('2026-08-08T18:18:00Z')).getTime();
                  playbackRate = 500;
                  playing = false;
                  toggleTrackSun = true;
                  forceRate = false;
                }"
                :color="accentColor"
                :focus-color="accentColor"
                tooltip-text="Reset"
                tooltip-location="top"
                tooltip-offset="5px"
                faSize="1x"
                :show-tooltip="!mobile"
              ></icon-button>
                    
              <v-dialog 
                v-if="!xSmallSize" 
                v-model="playbackVisible" 
                :scrim="false"
                location="top"
                offset="40"
                location-strategy="connected"
                persistent
                no-click-animation
                :retain-focus="false"
                >
                <template v-slot:activator="{ props }">
                  <icon-button
                    id="speed-control-icon"
                    @activate="() => {
                      playbackVisible = !playbackVisible;
                    }"
                    :fa-icon="playbackVisible ? 'times' : 'gauge-high'"
                    :color="accentColor"
                    :focus-color="accentColor"
                    tooltip-text="Speed Controls"
                    tooltip-location="top"
                    tooltip-offset="5px"
                    faSize="1x"
                    :show-tooltip="!mobile"
                    v-bind="props"
                  ></icon-button>
                </template>
                    <playback-control
                    class="desktop-playback-control"
                      v-if="playbackVisible"
                      :model-value="playbackRate"
                      @update:modelValue="(value: number) => {
                        forceRate = false;
                        playbackRate = value;
                      }"
                      :paused="!playing"
                      @paused="playing = !$event"
                      :max-power="3"
                      :max="Math.log10(1000) + 1"
                      :color="accentColor"
                      :inline="false"
                      show-close-button
                      @close="() => {
                        playbackVisible = false;
                      }"
                    /> 
              </v-dialog>
      

                <div v-if="xSmallSize" id="inline-speed-control">
                  <icon-button
                    id="speed-control-icon"
                    @activate="() => {
                      playbackVisible = !playbackVisible;
                    }"
                    :fa-icon="playbackVisible ? 'times' : 'gauge-high'"
                    :color="accentColor"
                    :focus-color="accentColor"
                    tooltip-text="Time Controls"
                    tooltip-location="top"
                    tooltip-offset="5px"
                    faSize="1x"
                    :show-tooltip="!mobile"
                  ></icon-button>

                    <playback-control
                      class="mobile-playback-control"
                      v-show="playbackVisible"
                      :model-value="playbackRate"
                      @update:modelValue="(value: number) => {
                        forceRate = false;
                        playbackRate = value;
                      }"
                      :paused="!playing"
                      @paused="playing = !$event"
                      :max-power="3"
                      :max="Math.log10(1000) + 1"
                      :color="accentColor"
                      :inline="true"
                      inline-button
                      @close="() => {
                        playbackVisible = false;
                      }"
                    /> 

                </div>
            </div>
            <div id="speed-text">
              Time rate: 
              <span v-if="playbackRate===1 && playing">
                Real time
              </span>
              <span v-if="playbackRate!=1 && playing">
                {{ niceRound(playbackRate) }}&times;
              </span>
              <span v-if="!playing">
                ({{ niceRound(playbackRate) }}&times;) Paused
              </span>
              <span v-if="playing && forceRate">
                (Slowed for totality)
              </span>
            </div>
          </div>
          <div id="slider">
            <v-slider
              v-model='selectedTime'
              :max="maxTime"
              :min="minTime"
              :color="accentColor"
              :ripple="false"
              hide-details
              track-size="8px"
              thumb-size="20px"
              thumb-label="always"
              :step="millisecondsPerInterval"
              @mousedown="() => {playing = false;}"
              >
              <template v-slot:thumb-label="item">
                {{ toTimeString(new Date(item.modelValue))  }}
              </template>
            </v-slider>
          </div>
          <div id="change-optout">
            <icon-button
              md-icon="mdi-lock"
              @activate="() => showPrivacyDialog = true"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="Change privacy settings"
              tooltip-location="bottom"
              tooltip-offset="5px"
              :show-tooltip="!mobile"
              mdSize="1em"
            >
            </icon-button>
          </div>
        </span>      
      </div>
      <div id="body-logos" v-if= "!smallSize">
        <credit-logos/>
      </div>
    </div>

<!--  -->
    <!-- Data collection opt-out dialog -->
    <v-dialog
      scrim="false"
      v-model="showPrivacyDialog"
      max-width="400px"
      id="privacy-popup-dialog"
    >
      <v-card>
        <v-card-text>
          To evaluate usage of this app, <strong>anonymized</strong> data may be collected, including locations viewed and map quiz responses. "My Location" data is NEVER collected.
        </v-card-text>
        <v-card-actions class="pt-3">
          <v-spacer></v-spacer>
          <v-btn
            color="#BDBDBD"
            href="https://www.cfa.harvard.edu/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
          Privacy Policy
          </v-btn>
          <v-btn
            color="#ff6666"
            @click="() => {
              responseOptOut = true;
              showPrivacyDialog = false;
            }"
          >
          Opt out
          </v-btn>
          <v-btn 
            color="green"
            @click="() => {
              responseOptOut = false;
              showPrivacyDialog = false;
            }"
          >
            Allow
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  <notifications group="copy-url" position="center top" classes="url-notification"/>
  <notifications dangerouslySetInnerHtml group="geolocation-error" position="center top" />
  </div>
</v-app>
</template>

<script lang="ts">
import { defineComponent, toRaw, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets, API_BASE_URL } from "@cosmicds/vue-toolkit";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Folder, Grids, LayerManager, Planets, Poly, Settings, WWTControl, Place, Texture, CAAMoon } from "@wwtelescope/engine";
import { distance } from "@wwtelescope/astro";
import { Annotation2, Poly2 } from "./Annotation2";

import { getTimezoneOffset, formatInTimeZone } from "date-fns-tz";
import tzlookup from "tz-lookup";
import { v4 } from "uuid";

import { drawPlanets, drawSkyOverlays, getScreenPosForCoordinates, makeAltAzGridText, layerManagerDraw, updateViewParameters, renderOneFrame } from "./wwt-hacks";
import pointInPolygon from 'point-in-polygon';

import { recalculateForObserverUTC } from "./eclipse_predict";
import { EclipseData } from "./eclipse_types";
import { spaceHMS } from './utils';


interface CloudData {
  lat: number;
  lon: number;
  cloudCover: number;
}

// interface CloudCoverData {
//   [key: string]: CloudData[];
// }



type SheetType = "text" | "video" | null;
type LearnerPath = "Location" | "Clouds" | 'CloudDetail' | "Learn";
type ViewerMode = "Horizon";
type MoonImageFile = "moon.png" | "moon-dark-gray-overlay.png" | `moon-sky-blue-overlay-${number}.png` | "empty.png";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// The field names here come from MapBox
export interface MapBoxFeature {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  place_type: string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  place_name: string;
  text?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  properties: { short_code: string; };
  center: [number, number];
  context: MapBoxContextItem[];
}

export interface MapBoxFeatureCollection {
  type: "FeatureCollection";
  features: MapBoxFeature[];
}

export interface MapBoxContextItem {
  id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  mapbox_id: string;
  text: string;
  wikidata: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  short_code?: string;
}


// number of milliseconds since January 1, 1970, 00:00:00 UTC
// month is indexed from 0..?!
// https://www.timeanddate.com/eclipse/solar/2023-october-14#eclipse-table
const eclipseStartTime = Date.UTC(2026, 7, 12, 4, 1); // partial eclipse starts at 15:40 UTC
const eclipseFinishTime = Date.UTC(2026, 7, 13, 3, 59); // partial eclipse ends at  20:55 UTC
console.log("Eclipse start time", new Date(eclipseStartTime));
console.log("Eclipse finish time", new Date(eclipseFinishTime));
const extraTime = 1000 * 60 * 60 * 0; // add 2 hours to the end time to make sure we get the full eclipse
const minTime = eclipseStartTime - extraTime;
const maxTime = eclipseFinishTime + extraTime;
console.log("Min time", new Date(minTime).toISOString());
console.log("Max time", new Date(maxTime).toISOString());
const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 40;
const MILLISECONDS_PER_INTERVAL = 1000 * secondsInterval;

const times: number[] = [];

let t = minTime;
while (t <= maxTime) {
  times.push(t);
  times.push(t + MILLISECONDS_PER_INTERVAL);
  t += MILLISECONDS_PER_INTERVAL;
}

type LocationRad = {
  longitudeRad: number;
  latitudeRad: number;
};

type LocationDeg = {
  longitudeDeg: number;
  latitudeDeg: number;
};


type EquatorialRad = {
  raRad: number;
  decRad: number;
};

type HorizontalRad = {
  altRad: number;
  azRad: number;
};

type OptionalFieldsShallow<T> = {
  [P in keyof T]?: T[P]
};

type QueryData = OptionalFieldsShallow<LocationDeg & { splash: boolean } & {awv: boolean}>;

let queryData: QueryData = {};
const UUID_KEY = "eclipse-mini-uuid" as const;
const OPT_OUT_KEY = "eclipse-mini-optout" as const;

const RELEVANT_FEATURE_TYPES = ["postcode", "place", "region", "country"];
const NA_COUNTRIES = ["United States", "Canada", "Mexico"];
const NA_ABBREVIATIONS = ["US-", "CA-", "MX-"];

import { dsvFormat } from "d3-dsv";
import { eclipse } from "./eclipse_path";

function parseLatLon(latD: string, latM: string, lonD: string, lonM: string): LocationDeg {

  const lat = +latD;
  // split off last character of latM as N/S
  const latSign = latM.slice(-1) === "N" ? 1 : -1;
  const latMin = +latM.slice(0, -1);
  const latDeg = latSign * (lat + latMin / 60);
  
  const lon = +lonD;
  // split off last character of lonM as W/E
  const lonSign = lonM.slice(-1) === "E" ? 1 : -1;
  const lonMin = +lonM.slice(0, -1);
  const lonDeg = lonSign * (lon + lonMin / 60);
  
  return {
    latitudeDeg: latDeg,
    longitudeDeg: lonDeg
  };
}

function parseEclipsePath(csv: string) {
  const tsv = dsvFormat('|');

  return tsv.parseRows(csv, (d) => {
    // parse rows based on space delimieted eclipse_path.txt

    const utcString = d[1].split(':');
    const utc = new Date(eclipseStartTime);
    utc.setUTCHours(+utcString[0]);
    utc.setUTCMinutes(+utcString[1]);
    utc.setUTCSeconds(0);
    utc.setUTCMilliseconds(0);
    
    
    const northernLimit = parseLatLon(d[2], d[3], d[4], d[5]);
    const southernLimit = parseLatLon(d[6], d[7], d[8], d[9]);
    const centerLine = parseLatLon(d[10], d[11], d[12], d[13]);
    const ratio = +d[14];
    const sunAlt = +d[15];
    const sunAz = +d[16];
    const pathWidth = +d[17];
    const eclipseDuration = d[18];
    // content for the popup : eclipse time (UTC) and duration
    const tz = tzlookup(centerLine.latitudeDeg, centerLine.longitudeDeg);
    const localTimeString = formatInTimeZone(utc.getTime(), tz, "h:mm aa (zzz)");
    const popupContent = `Eclipse time (local): ${localTimeString} <br/>Eclipse time (UTC): ${d[1]} <br/>Duration: ${eclipseDuration}`;
    
    return {
      'utc': utc.getTime(),
      'northernLimit': northernLimit,
      'southernLimit': southernLimit,
      'centerLine': centerLine,
      'ratio': ratio,
      'sunAlt': sunAlt,
      'sunAz': sunAz,
      'pathWidth': pathWidth,
      'eclipseDuration': eclipseDuration,
      'popupContent': popupContent
    };
    
  });
}

const eclipsePath = parseEclipsePath(eclipse);


/** PARSE CLOUD COVERAGE DATA **/
import cloudCover from "./assets/cloud_cover.csv";
import { csvParseRows } from "d3-dsv";

// the first row is the longitude values
// the first column is the latitude values
// the data lies in the interior of the matrix
let cloudData: number[][] = csvParseRows(cloudCover, (d, _i) => {
  // loop over the row and convert each value to a number ("+v")
  return d.map((v) => +v);
});

// lon and lat are first col and row (dropping the first value)
const minLat = Math.min(...cloudData.map(d => d[0]).slice(1));
const maxLat = Math.max(...cloudData.map(d => d[0]).slice(1));
const minLon = Math.min(...cloudData[0].slice(1));
const dLon = cloudData[0][2] - cloudData[0][1];
const dLat = cloudData[2][0] - cloudData[1][0];
console.log("minLat, minLon, dLat, dLon", minLat, minLon, dLat, dLon);
// get just the inner data grid
cloudData = cloudData.slice(1).map(row => row.slice(1));

// conver cloudData from array to CloudData[] for locationselector
const cloudDataArray: CloudData[] = [];
cloudData.forEach((row, i) => {
  row.forEach((cc, j) => {
    cloudDataArray.push({
      lat: maxLat + dLat * i,
      lon: minLon + dLon * j,
      cloudCover: cc
    });
  });
});

console.log("cloud cover data loaded");

const wwtMove = WWTControl.singleton.move;

/* READ IN Eclipse Umbra */
import eclipseUmbra from "./assets/upath_lo.json";

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wwtNamespace: {
      type: String,
      required: true
    },
    // http://localhost:8081/?lat=42.243208914562764&lon=-3.9245888745091406
    initialCameraParams: {
      type: Object as PropType<Omit<GotoRADecZoomParams, 'instant'>>,
      default() {
        return {
          // RA/Dec of Sun in Nazas, Mexico close to max totality
          raRad: 3.481,
          decRad: -0.145,
          zoomDeg: 20,
        };
      },
    },
  },
  data() {
    const totalEclipseTimeUTC = new Date("2026-08-12T20:30:59Z");

    const sunPlace = new Place();
    sunPlace.set_names(["Sun"]);
    sunPlace.set_classification(Classification.solarSystem);   
    sunPlace.set_target(SolarSystemObjects.sun);
    sunPlace.set_zoomLevel(20);

    const moonPlace = new Place();
    moonPlace.set_names(["Moon"]);
    moonPlace.set_classification(Classification.solarSystem);
    moonPlace.set_target(SolarSystemObjects.moon);
    const initialView = {
      initialLocation: {
        latitudeDeg: 42,
        longitudeDeg: -4
      },
      initialZoom: 3.3
    };

    const userSelectedLocations: [number, number][] = [];
    const [latitudeDeg, longitudeDeg] = [queryData.latitudeDeg, queryData.longitudeDeg];
    
    let initialMapOptions = initialView;
    if (latitudeDeg !== undefined && longitudeDeg !== undefined) {
      userSelectedLocations.push([latitudeDeg, longitudeDeg]);
      initialMapOptions = {
        initialLocation: { latitudeDeg, longitudeDeg },
        initialZoom: 5
      };
    }

    const maybeUUID = window.localStorage.getItem(UUID_KEY);
    const existingUser = maybeUUID !== null;
    const uuid = maybeUUID ?? v4();
    if (!existingUser) {
      window.localStorage.setItem(UUID_KEY, uuid);
    }
    
    const storedOptOut = window.localStorage.getItem(OPT_OUT_KEY);
    const responseOptOut = typeof storedOptOut === "string" ? storedOptOut === "true" : null;
    const location: LocationRad = (latitudeDeg !== undefined && longitudeDeg !== undefined) ?
      { latitudeRad: D2R * latitudeDeg, longitudeRad: D2R * longitudeDeg } :
      { latitudeRad: D2R * 41.05651083190793, longitudeRad: D2R * -2.3823344069458017 };
    return {
      totalEclipseTimeUTC,
      showNewMobileUI: true,
      showForecastSheet: false,
      
      selectedCloudCoverVariable: 'median', // Define selectedCloudCoverVariable
      cloudCoverData: cloudDataArray as CloudData[],
      rectangleDegrees: Math.abs(dLat),
      
      uuid,
      infoTimeMs: 0,
      userGuideTimeMs: 0,
      weatherTimeMs: 0,
      weatherInfoTimeMs: 0,
      eclipseTimerTimeMs: 0,
      forecastInfoTimeMs: 0,
      appStartTimestamp: Date.now(),
      infoStartTimestamp: null as number | null,
      userGuideStartTimestamp: null as number | null,
      weatherStartTimestamp: null as number | null,
      weatherInfoStartTimestamp: null as number | null,
      eclipseTimerStartTimestamp: null as number | null,
      forecastInfoStartTimestamp: null as number | null,
      weatherInfoOpen: false,
      responseOptOut: responseOptOut as boolean | null,

      showSplashScreen: queryData.splash ?? true, 
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,

      wwtMove: null as ((x: number, y: number) => void) | null,

      searchOpen: true,
      searchText: null as string | null,
      searchResults: null as MapBoxFeatureCollection | null,
      searchErrorMessage: null as string | null,
      locationJustUpdated: false,

      showMapTooltip: false,
      showTextTooltip: false,
      showMapSelector: false,
      showLocationSelector: false,
      getMyLocation: true,
      myLocation: null as LocationDeg | null,
      geolocationPermission: '' as 'granted' | 'denied' | 'prompt',
      
      showWWTGuideSheet: false,
      showAdvancedWeather: queryData.awv ?? false,
      showAWVMapByDefault: queryData.awv ?? false,
      showAWVChartsByDefault: queryData.awv ?? false,
      showAWVFullScreen: false,
      
      showEclipsePredictionSheet: false,
      showEclipsePredictionText: true,
      showEclipsePredictionTextBanner: false,
      
      
      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,  

      // "Greatest Eclipse"
      selectedTime:  totalEclipseTimeUTC.getTime(),
      selectedTimezone: "Europe/Madrid",
      location,
      selectedLocationText: "Antiguita, Spain",
      locationErrorMessage: "",
            
      syncDateTimeWithWWTCurrentTime: true,
      syncDateTimewithSelectedTime: true,

      sunOffset: null as { x: number; y: number } | null,

      presetMapOptions: {
        templateUrl: "https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg",
        minZoom: 1,
        maxZoom: 16,
        attribution: 'Maptiles by Stamen Design, under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" href="https://www.openstreetmap.org/#map=4/38.01/-95.84">OpenStreetMap</a>, under <a target="_top" href="http://creativecommons.org/licenses/by-sa/2.0">CC BY-SA 2.0</a>',
        ext: 'jpg',
        ...initialView
      },
      
      initialMapOptions,

      userSelectedMapOptions: {
        // templateUrl: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
        templateUrl: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        ...(queryData ? { ...queryData, initialZoom: 5 } : initialView)
      },
      
      eclipseCenterLine: eclipsePath,
      currentFractionEclipsed: 0,

      placeCircleOptions: {
        color: "#0000FF",
        fillColor: "#0000FF",
        fillOpacity: 0.7,
        radius: 5 
      },

      selectedCircleOptions: {
        color: "#FF0000",
        fillColor: "#FF0000",
        fillOpacity: 0.7,
        radius: 5
      },

      learnerPath: "Location" as LearnerPath,
      visitedCloudCover: false,
      
      playing: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,
      playingWaitCount: 0,

      activePointer: false,
      showControls: true,
      sunCenteredTracking: true,
      showAltAzGrid: false,
      showHorizon: true,
      showTextSheet: false, 
      showLinkToPath: false, 
      
      toggleTrackSun: true,
      
      times,
      minTime,
      maxTime,
      millisecondsPerInterval: MILLISECONDS_PER_INTERVAL,
      nowOutsideTimeRange: false,
      
      accentColor: "#eac402",
      moonColor: "#CFD8DC",
      guidedContentHeight: "300px",
      showGuidedContent: true,

      inIntro: false,
      displaySwitchOn: true,
      displaySwitchOff: false,
      scrollUp: false,

      showPrivacyDialog: false,
      showMyLocationDialog: false,

      tab: 0,
      infoPage: 1,
      introSlide: 1,
      
      viewerMode: 'Horizon' as ViewerMode,

      showSky: true,
      skyColorNight: "#1F1F1F",
      skyColorLight: "#4190ED",
      skyColor: "#4190ED",
      skyOpacity: 0.6,
      horizonOpacity: 1,
      useRegularMoon: false,
      moonTexture: 'moon-sky-blue-overlay.png' as MoonImageFile,

      playbackRateValue: 1,
      forceRate: false,
      playbackVisible: false,
      
      horizonRate: 500, 
      scopeRate: 100, 

      startPaused: false,

      sunPlace,
      moonPlace,

      queryData,
      //  source https://svs.gsfc.nasa.gov/5123/ shapefiles converted to geojson using mapshaper.org/
      // the order is the layer order form bottom to top
      geojson: [
        {
          geojson: eclipseUmbra as GeoJSON.GeometryCollection,
          style: {fillColor: '#333', weight: 1, opacity: 0, fillOpacity: 0.3, id:"upath"}
        },
        {
          url: "https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/center_2026.json",
          style: {color: '#ff0000', weight: 2, opacity: 1, fillOpacity: 0}
        },
        // { // individual places
        //   'geojson': _eclipsePathGeoJson as GeoJSON.FeatureCollection,
        //   'style': {radius:3,fillColor: '#ccc', color:'#222', weight: 2, opacity: 1, fillOpacity: 1}
        // }
      ],
      

      userSelectedLocations,
      cloudCoverSelectedLocations: [] as [number, number][],
      textSearchSelectedLocations: [] as [number, number][],
      advancedWeatherSelectedCount: 0,
      cloudCoverSelectedCount: 0,
      eclipsePrediction: null as EclipseData<Date> | null,
      eclipseStart: 0 as number | null,
      eclipseMid: 0 as number | null,
      eclipseEnd: 0 as number | null,
      eclipseApproach: 'entering' as 'entering' | 'leaving',
      eclipseType: null as "Partial" | "Total" | "Annular" | 'None' | null,
      showEclipseTimer:true,
    };
  },

  beforeCreate() {
    const searchParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lon = parseFloat(searchParams.get("lon") ?? "");
    if (lat && lon) {
      queryData = {
        latitudeDeg: lat, longitudeDeg: lon
      };
    }
    const splashQuery = searchParams.get("splash");
    queryData.splash = splashQuery !== "false";
    const awv = searchParams.get("awv");
    queryData.awv = awv === "true";
  },

  mounted() {  

    setInterval(() => {
      this.nowOutsideTimeRange = Date.now() < this.minTime || Date.now() > this.maxTime;
    }, 1000);

    if (queryData.latitudeDeg !== undefined && queryData.longitudeDeg !== undefined) {
      this.selectedTimezone = tzlookup(...[queryData.latitudeDeg, queryData.longitudeDeg]);
      this.updateSelectedLocationText();
    }
    
    
    if (!this.showSplashScreen) {
      this.showEclipsePredictionTextBanner = true;
    }
    
    this.searchOpen = this.smAndUp;
    
    this.createUserEntry();

    // We just need to force these to get around some Safari issues whose cause is TBD
    Planets._loadPlanetTextures();
    Planets.updatePlanetLocations(false);

    this.waitForReady().then(async () => {

      this.backgroundImagesets = [...skyBackgroundImagesets];

      // console.log(this);
      this.setTime(this.dateTime);

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);

      // This is kinda horrible, but it works!

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._drawSkyOverlays = drawSkyOverlays;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Grids._makeAltAzGridText = makeAltAzGridText;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      LayerManager._draw = layerManagerDraw;      

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._updateViewParameters = updateViewParameters.bind(this.wwtControl);

      this.wwtMove = this.wwtControl.move;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.roll = function(_angle) {};
      this.wwtControl._tilt = function(_angle) {};
      this.updatePanForMobile();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.renderOneFrame = renderOneFrame.bind(this.wwtControl);

      // Force the render of one frame so that planet textures will be loaded
      // We don't want to attach the callback before this so that we don't mess up sun tracking
      this.wwtControl.renderOneFrame();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.renderFrameCallback = this.onWWTRenderFrame;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Planets.drawPlanets = (renderContext: RenderContext, opacity: number) => {
        drawPlanets(renderContext, opacity, this.currentFractionEclipsed);
      };


      /* eslint-disable @typescript-eslint/no-var-requires */
      Planets['_planetTextures'][0] = Texture.fromUrl(require("./assets/2023-09-19-SDO-Sun.png"));
      this.setForegroundImageByName("Digitized Sky Survey (Color)");
      // this.setBackgroundImageByName("Black Sky Background");
      this.setForegroundOpacity(100);

      // The initial Moon position is incorrect, and we use it to set the Moon sprite.
      // Thus, we explicitly call for an update here.
      this.moonPlace.updatePlanetLocation(this.wwtCurrentTime.getTime());
      this.updateMoonTexture(true);

      this.updateWWTLocation();
      
      this.setClockSync(!queryData.splash); // set to true if queryData.splash == false
      this.playing = !queryData.splash;

      this.setClockRate(1); //

      this.playbackRate = 1;  //this.setplaybackRate('8 minutes per second'); // 500;
      
      // If there are layers to set up, do that here!
      this.layersLoaded = true;

      this.startHorizonMode();

      this.trackSun().then(() => this.positionSet = true);
      this.getEclipsePrediction();
      // this.setTimeforSunAlt(10); // 10 degrees above horizon
      
      console.log("selected time", this.selectedTime, new Date(this.selectedTime).toISOString());
      setInterval(() => {
        if (this.playing) {
          const time = this.wwtCurrentTime;
          this.selectedTime = time.getTime();
          this.updateFrontAnnotations(time);
        }
      }, 500);
      
      window.addEventListener('keyup', (event: KeyboardEvent) => {
        if (["Esc", "Escape"].includes(event.key) && this.showVideoSheet) {
          this.showVideoSheet = false;
        }
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.sendUpdateData();
        } else {
          this.resetData();
        }
      });

    }).then(() => {
      this.selectedTime = this.eclipseMid ?? this.totalEclipseTimeUTC.getTime();
      this.setTime(new Date(this.selectedTime));
      this.updateFrontAnnotations(new Date(this.selectedTime));
    });

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });

    this.showControls = !this.narrow;
    this.showGuidedContent = !this.xSmallSize;

    this.updateSkyOpacityForSunAlt(10 * D2R); // 10 degrees above horizon

    const element = document.getElementById("guided-content-container");
    if (element) {
      element.addEventListener("scroll", () => this.onScroll());
    }
    
  },

  computed: {
    
    eclipsePredictionText(): string {
      
      if (!this.showEclipsePredictionText) {
        return 'Open "Timing Details" to see eclipse predictions';
      }
      
      if (this.eclipsePrediction) {
        const { type, maxTime, duration } = this.eclipsePrediction;
        if (type === '' || type === null || maxTime[0] === null) {
          return "No eclipse";
        }
        const typeString = (new Map([
          ["P", "Partial"],
          ["T", "Total"],
          ["A", "Annular"],
        ])).get(type);
        
        // const maxTimeString = formatInTimeZone(maxTime[0], this.selectedTimezone, "h:mm aa (zzz)");
        
        if (type == "T") {
          const begins = formatInTimeZone(this.eclipsePrediction.centralStart[0], this.selectedTimezone, "h:mm:ss aa (zzz)");
          if (this.$vuetify.display.xs) {
            return `Totality starts: ${begins} Duration: ${spaceHMS(duration)}`;
          }
          return `Totality begins at ${begins} and lasts ${spaceHMS(duration)}`;
        }
        

        if (duration === '') {
          // get the duration of the partial eclipse
          const starting = formatInTimeZone(this.eclipsePrediction.partialStart[0], this.selectedTimezone, "h:mm aa (zzz)");
          if (this.$vuetify.display.xs) {
            return `${typeString} starts: ${starting}`;
          }
          return `${typeString} eclipse begins at ${starting}`;
        }
      }
      return '';
    },

    selectedCloudCoverData(): CloudData[] | null {
      if (this.cloudCoverData != null) {
        return this.cloudCoverData;
      } else {
        console.log('selectedCloudCoverData: cloud cover data not loaded');
        return null;
      }
    },


    dateTime() {
      return new Date(this.selectedTime);
    },

    selectedTimezoneOffset() {
      return getTimezoneOffset(this.selectedTimezone);
    },

    selectedLocalDateString() {
      return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MMMM dd, yyyy');
    },
    
    selectedLocaledTimeDateString() {
      if (this.smallSize) {
        return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd, h:mm:ss aa');
      } else {
        return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd/yyyy h:mm:ss aa (zzz)');
      }

    },
    
    selectedLocationCloudCover(): number | null {
      if (this.locationDeg) {
        return this.getCloudCover(this.locationDeg.latitudeDeg, this.locationDeg.longitudeDeg);
      } else {
        return null;
      }
    },
    
    cloudIcon() {
    
      if (this.selectedLocationCloudCover == null) {
        return 'mdi-cloud-cancel';
      } 
      else if (this.selectedLocationCloudCover < .25) {
        return 'mdi-weather-sunny';
      }
      else if (this.selectedLocationCloudCover < .5) {
        return 'mdi-weather-partly-cloudy';
      } 
      else if (this.selectedLocationCloudCover < 0.9) {
        return 'mdi-weather-cloudy';
      } 
      else {
        return 'mdi-clouds';
      } 
    },
    
    selectedLocationCloudCoverString():string {
      if (this.selectedLocationCloudCover !== null) {
        return `Hist Cld Cvr: ${(this.selectedLocationCloudCover * 100).toFixed(0)}%`;
      }
      return "Outside Range";

    },
    
    myLocationToolTip() {
      if (this.geolocationPermission === 'denied') {
        return "Geolocation disabled. Check browser and site permissions and reload page.";
      } else if (this.geolocationPermission === 'prompt') {
        return "Click to enable location permissions";
      } else {
        return "Use my location";
      } 
    },
    
    myLocationColor() {
      console.log(this.geolocationPermission);
      if (this.geolocationPermission === 'denied') {
        return "grey";
      }
      
      if (this.geolocationPermission === 'prompt') {
        return "grey";
      }
      
      if (this.geolocationPermission === 'granted') {
        
        if (this.myLocation) {
          // check if location = myLocation. if not fade the color a bit.
          if (
            this.locationDeg.latitudeDeg === this.myLocation.latitudeDeg && this.locationDeg.longitudeDeg === this.myLocation.longitudeDeg
          ) {
            return this.accentColor;
          } else {
            return this.accentColor;
          }
        }
      }
      
      return this.accentColor;
      
      
    },

    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
    },
    selectedDate(): Date {
      return new Date(this.selectedTime);
    },
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    smAndUp(): boolean {
      return this.$vuetify.display.smAndUp;
    },
    xSmallSize(): boolean {
      return this.$vuetify.display.xs;
    },
    narrow(): boolean {
      return this.$vuetify.display.width <= 600;
    },
    
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--sky-color': this.skyColorLight,
        '--app-content-height': this.showInfoSheet ? '100%' : '100%',
        '--top-content-height': this.showGuidedContent? this.guidedContentHeight : this.guidedContentHeight,
        '--moon-color': this.moonColor,
      };
    },
    forwardGeocodingCss() {
      return {
        '--fg-container-padding': this.searchOpen ? '5px 10px 12px 10px' : '0px',
      };
    },
    wwtControl(): WWTControl {
      return WWTControl.singleton;
    },

    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    // dontSetTime(): boolean {
    //   return this.selectedTime %MILLISECONDS_PER_DAY !== 0;
    // },
    
    userZoom: {
      get(): number {
        return Math.round(Math.log10(this.wwtZoomDeg)*100)/100;
      },
      set(value: number) {
        this.gotoRADecZoom({
          raRad: this.wwtRARad,
          decRad: this.wwtDecRad,
          zoomDeg: Math.pow(10,value),
          rollRad: 0,
          instant: true
        });
      }
    },
    
    wwtContentHeight(): number | null {
      // console.log("wwtContentHeight", this.guidedContentHeight);
      const mainContent = document.getElementById('main-content');
      const windowHeight = window.innerHeight;
      
      if (mainContent) {
        console.log(windowHeight);
        return windowHeight; // - parseInt(this.guidedContentHeight.replace('px', ''));
      } else {
        return null;
      }
    } , 

    showInfoSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
      }
    },

    locationDeg: {
      get(): LocationDeg {
        return {
          latitudeDeg: R2D * this.location.latitudeRad,
          longitudeDeg: R2D * this.location.longitudeRad
        };
      },
      set(value: LocationDeg) {
        this.location = {
          latitudeRad: D2R * value.latitudeDeg,
          longitudeRad: D2R * value.longitudeDeg
        };
      }
    },

    tickDurationMS(): number {
      return MILLISECONDS_PER_INTERVAL / (this.playbackRate);
    },

    maxPlaybackRate(): number {
      const minDuration = 10; //min setInterval on Chrome is ~5ms
      // console.log('maxPlaybackRate', MILLISECONDS_PER_INTERVAL / minDuration);
      return MILLISECONDS_PER_INTERVAL / minDuration;
    },
    
    sunPosition(): EquatorialRad & HorizontalRad {
      const sunAltAz = this.equatorialToHorizontal(this.sunPlace.get_RA() * 15 * D2R,
        this.sunPlace.get_dec() * D2R,
        this.location.latitudeRad,
        this.location.longitudeRad,
        this.dateTime);

      return {
        raRad: this.sunPlace.get_RA() * 15 * D2R,
        decRad: this.sunPlace.get_dec() * D2R,
        ...sunAltAz
      };
    },

    moonPosition(): EquatorialRad & HorizontalRad {
      const moonAltAz = this.equatorialToHorizontal(this.moonPlace.get_RA() * 15 * D2R,
        this.moonPlace.get_dec() * D2R,
        this.location.latitudeRad,
        this.location.longitudeRad,
        this.dateTime);

      return {
        raRad: this.moonPlace.get_RA() * 15 * D2R,
        decRad: this.moonPlace.get_dec() * D2R,
        ...moonAltAz
      };
    },

    sunAboveHorizon(): boolean {
      return this.sunPosition.altRad > 0;
    },

    percentEclipsedText(): string {
      let percentEclipsed = Math.abs(this.currentFractionEclipsed * 100).toFixed(0);
      if (this.currentFractionEclipsed < 1 && percentEclipsed === "100") {
        percentEclipsed = "99";
      }
      return `Eclipsed: ${percentEclipsed}%`;
    },

    trackingSun: {
      set(value: boolean) {
        if(this.sunOffset === null) {
          this.sunCenteredTracking = value;
        } else {
          this.sunCenteredTracking = false;
        }
      },
      
      get(): boolean {
        // do something more useful later
        return this.toggleTrackSun;
      }   
    },

    defaultRate(): number {
      return this.viewerMode === 'Horizon' ? this.horizonRate : this.scopeRate;
    },
    
    inEclipse(): boolean | null {
      if (this.eclipsePrediction && this.eclipseStart != null && this.eclipseEnd != null) {
        return this.wwtCurrentTime.getTime() >= this.eclipseStart && this.wwtCurrentTime.getTime() <= this.eclipseEnd;
      } else {
        return null;
      }
    },
    
    // before during or after the eclipse
    eclipsePhase(): 'before' | 'during' | 'after' | null {
      if (this.eclipsePrediction && this.eclipseStart != null && this.eclipseEnd != null) {
        if (this.wwtCurrentTime.getTime() < this.eclipseStart) {
          return 'before';
        } else if (this.wwtCurrentTime.getTime() > this.eclipseEnd) {
          return 'after';
        } else {
          return 'during';
        }
      } else {
        return null;
      }
    },
    
    nearTotality(): boolean {
      let nearEclipseMax = false;
      if (this.eclipsePrediction) {
        if (this.eclipsePrediction.maxTime[0]) {
          nearEclipseMax = Math.abs(this.eclipsePrediction.maxTime[0].getTime() - this.wwtCurrentTime.getTime()) < 120_000;
        }
      }

      // if the eclipse prediction isn't available fallback on the current fraction eclipsed
      return this.locationInTotality && (nearEclipseMax || this.currentFractionEclipsed > .99);
    },
    
    playbackRate: {
      set(value: number) {
        this.playbackRateValue = Math.sign(value) * Math.min(Math.abs(value), 5000);
      },
      get(): number {
        if (this.forceRate) {
          const sign = Math.sign(this.playbackRateValue);
          return sign * Math.min(10, sign * this.playbackRateValue);
        } 
        return this.playbackRateValue;        
      }
    },
    
    locationInTotality() {
      // check if the location is within eclipseUmbra path
      const location = this.locationDeg;
      const poly = eclipseUmbra.geometries[0].coordinates[0];
      const point = [location.longitudeDeg, location.latitudeDeg];
      return pointInPolygon(point, poly);
    },


    showVideoSheet: {
      get(): boolean {
        return this.sheet === "video";
      },
      set(_value: boolean) {
        this.selectSheet('video');
        // if (!value) {
        //   // const video = document.querySelector("#info-video") as HTMLVideoElement;
        //   // video.pause();
        // }
      }
    },

    showOldMobileUI: {
      get(): boolean {
        return !this.showNewMobileUI;
      },
      set(value: boolean) {
        this.showNewMobileUI = !value;
      },
    },

  },

  methods: {
    
    pauseForOverlay() {
      const increment = this.playing  || this.playingWaitCount > 0;
      this.playingWaitCount = increment ? this.playingWaitCount + 1 : this.playingWaitCount;
      this.playing = false;
      
    },
    
    playForOverlay() {
      if (this.playingWaitCount === 1) {
        console.log('playForOverlay');
        this.playing = true;
      } 
      
      this.playingWaitCount = this.playingWaitCount === 0 ? 0 : this.playingWaitCount - 1;

    },

    updatePanForMobile() {
      if (this.showNewMobileUI) {
        this.wwtControl.move = function(_x, _y) {};
      } else {
        this.wwtControl.move = wwtMove;
      }
    },

    onScroll() {
      const el = document.getElementById('guided-content-container');

      if (el) {
        const scrollUp = el.scrollTop > 0;
        if (this.scrollUp !== scrollUp) {
          this.scrollUp = scrollUp;
        }
      }

    },
    
    scrollToTop() {
      const element = document.getElementById("guided-content-container");
      if (element) {
        if (this.scrollUp) {
          element.scrollTo({ top: 0 });
        } else {
          element.scrollTo({ top: element.scrollHeight });
        }
      }
    },
    

    cloudColorMap(v: number) {
      const cc = this.sigmoid(v);
      return `hsl(0, 0%, 100%, ${0.9 * cc * 100}%)`;
    },
    
    sigmoid(val: number | null): number {
      if (val === null) {
        return 0;
      }
      // return sigmoid
      const y = (val - 0.5) / .12;
      const z = Math.exp(y);
      return z / (1 + z);
    },

    async trackSun(): Promise<void> {
      this.sunOffset = null;
      return this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: true,
        trackObject: true
      });
    },

    async centerSun(): Promise<void> {
      this.sunOffset = null;
      this.toggleTrackSun = true;
      this.sunCenteredTracking = true;
      return this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: true,
        trackObject: this.trackingSun
      });
    },

    async trackSunOffset(): Promise<void> {
      this.sunCenteredTracking = false;
      const place = this.getSunOffsetWorldPosition();
      if (place !== null) {
        return this.gotoTarget({
          place,
          noZoom: true,
          instant: true,
          trackObject: true
        });
      } else {
        return Promise.resolve();
      }
    },

    getSunOffsetWorldPosition(): Place | null {
      if (this.sunOffset === null) {
        return null;
      }

      const sunLocation = Planets['_planetLocations'][0];
      const sunPoint = getScreenPosForCoordinates(this.wwtControl, sunLocation.RA, sunLocation.dec);
      const offsetPoint = { x: sunPoint.x + this.sunOffset.x, y: sunPoint.y + this.sunOffset.y };
      const offsetLocation = this.findRADecForScreenPoint(offsetPoint);
      const place = new Place();
      place.set_RA(offsetLocation.ra / 15);
      place.set_dec(offsetLocation.dec);

      return place;
    },

    angleInZeroToTwoPi(angle: number): number {
      const twoPi = 2 * Math.PI;
      return ((angle% twoPi) + twoPi) % twoPi;
    },

    // This assumes that the input angles are in the range [0, 2pi)
    angleBetween(test: number, lower: number, upper: number): boolean {
      if (lower < upper) {
        return test >= lower && test <= upper;
      } else {
        return test >= lower || test <= upper;
      }
    },
    
    // eslint-disable-next-line @typescript-eslint/naming-convention
    greatCircleDistance(coord1: { RA: number; dec: number; }, coord2: { RA: number; dec: number; }): number {
      const ra1 = coord1.RA * 15 * D2R;
      const dec1 = coord1.dec * D2R;
      
      const ra2 = coord2.RA * 15 * D2R;
      const dec2 = coord2.dec * D2R;
      
      return distance(ra1, dec1, ra2, dec2);
    },
    
    updateIntersection() {

      if (Planets['_planetLocations'] == null) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const canvasHeight: number = this.wwtControl.canvas.height;

      const sunPosition = Planets['_planetLocations'][0];
      const moonPosition = Planets['_planetLocations'][9];
      const sunPoint = getScreenPosForCoordinates(this.wwtControl, sunPosition.RA, sunPosition.dec);
      const moonPoint = getScreenPosForCoordinates(this.wwtControl, moonPosition.RA, moonPosition.dec);
      moonPoint.y = canvasHeight - moonPoint.y;
      sunPoint.x -= moonPoint.x;
      sunPoint.y = canvasHeight - sunPoint.y - moonPoint.y;

      const jd = this.getJulian(this.selectedDate);
      const distanceToMoon = CAAMoon.radiusVector(jd);
      const distanceToSun = 149_597_871;

      const rMoon = 1737.4;  // radius of the moon in km
      const rSun = 696_340;
      const thetaMoon = Math.atan2(rMoon, distanceToMoon);
      const thetaSun = Math.atan2(rSun, distanceToSun);

      // The factor of 6 comes from the relation between wwtZoomDeg and the actual size of the FOV in degrees
      const rMoonPx = 6 * thetaMoon * canvasHeight / (this.wwtZoomDeg * D2R);
      const rSunPx = 6 * thetaSun * canvasHeight / (this.wwtZoomDeg * D2R);

      const points: { x: number; y: number }[] = [];
      const sunMoonDistance = Math.sqrt(sunPoint.x * sunPoint.x + sunPoint.y * sunPoint.y);

      // If there's no sun/moon intersection, no need to continue
      if (sunMoonDistance > rMoonPx + rSunPx) {
        this.currentFractionEclipsed = 0;
        return;
      }

      const moonInsideSun = sunMoonDistance < rSunPx - rMoonPx;
      const sunInsideMoon = sunMoonDistance < rMoonPx - rSunPx;

      const dSq = sunMoonDistance * sunMoonDistance;
      const rMoonSq = rMoonPx * rMoonPx;
      const rSunSq = rSunPx * rSunPx;

      const moonArea = Math.PI * rMoonSq;
      const sunArea = Math.PI * rSunSq;
      let fractionEclipsed = 0;
      if (moonInsideSun || sunInsideMoon) {
        fractionEclipsed = moonArea / sunArea;
      } else {
        // See https://mathworld.wolfram.com/Circle-CircleIntersection.html
        const intersectionArea =
          rMoonSq * Math.acos((dSq + rMoonSq - rSunSq) / (2 * sunMoonDistance * rMoonPx)) +
          rSunSq * Math.acos((dSq + rSunSq - rMoonSq) / (2 * sunMoonDistance * rSunPx)) -
          0.5 * Math.sqrt(
            (rSunPx + rMoonPx - sunMoonDistance) * (sunMoonDistance + rMoonPx - rSunPx) * (sunMoonDistance - rMoonPx + rSunPx) * (sunMoonDistance + rSunPx + rMoonPx)
          );
        fractionEclipsed = intersectionArea / sunArea;
      }
      
      let forceTotality = false;
      if (this.locationInTotality && this.inEclipse) {
        if (this.currentFractionEclipsed <= 1) {
          this.currentFractionEclipsed = 1;
          forceTotality = true;
        }
      } else {
        const cfe = isNaN(fractionEclipsed) ? 1 : Math.max(Math.min(fractionEclipsed, 1), 0);
        if (cfe == 1) {
          // force a lower value to hide corona
          this.currentFractionEclipsed = .999;
        } else {
          this.currentFractionEclipsed = cfe;
        }
      }

      // If we're using the regular WWT moon, or in sun scope mode, we don't want the overlay but did want the percentage eclipsed
      if (this.useRegularMoon) {
        return;
      }

      const n = 50;
      // If the moon/sun is completely "inside" of the sun/moon
      if (moonInsideSun || sunInsideMoon || forceTotality) {
        for (let i = 0; i <= n; i++) {
          const angle = (i / n) * 2 * Math.PI;
          points.push({ x: rMoonPx * Math.cos(angle), y: rMoonPx * Math.sin(angle) });
        }
      } else {
        let x1: number;
        let y1: number;
        let x2: number;
        let y2: number;

        if (sunPoint.x === 0) {

          let ysh = 0.5 * sunPoint.y;
          if (ysh >= rMoonPx) {
            return;
          } else if (ysh === 0) {
            ysh = Math.min(rMoonPx, rSunPx);
          }
          x1 = Math.sqrt(rMoonPx * rMoonPx - ysh * ysh);
          if (isNaN(x1)) {
            console.error("x1 is NaN");
            this.currentFractionEclipsed = 0;
            return;
          }
          y1 = ysh;
          x2 = -x1;
          y2 = ysh;

        } else {

          // m is the slope of the line joining the moon and the sun
          // mPerp is the slope of a line perpendicular to the line joining the moon and the sun
          // yInt is the y-intercept of a line passing through the two points of intersection
          const epsilon = 1e-5;
          const mPerp = -sunPoint.x / (sunPoint.y + epsilon);
          const yInt = (sunPoint.x * sunPoint.x + sunPoint.y * sunPoint.y - (rSunPx * rSunPx - rMoonPx * rMoonPx)) / (2 * (sunPoint.y + epsilon));

          // Find the x-coordinates of the edge points of the moon-sun intersection
          const a = (1 + mPerp * mPerp);
          const b = 2 * mPerp * yInt;
          const c = yInt * yInt - rMoonPx * rMoonPx;

          const sqrDisc = Math.sqrt(b * b - 4 * a * c);
          if (isNaN(sqrDisc)) {
            console.error("sqrDisc is NaN");
            this.currentFractionEclipsed = 0;
            return;
          }
          x1 = (-b + sqrDisc) / (2 * a);
          x2 = (-b - sqrDisc) / (2 * a);
          y1 = mPerp * x1 + yInt;
          y2 = mPerp * x2 + yInt;
        }

        // The standard-position angle of the sun-moon line in the moon's reference frame
        const alpha = this.angleInZeroToTwoPi(Math.atan2(sunPoint.y, sunPoint.x));

        let theta1 = Math.atan2(y1 / rMoonPx, x1 / rMoonPx);
        let theta2 = Math.atan2(y2 / rMoonPx, x2 / rMoonPx);
        theta1 = this.angleInZeroToTwoPi(theta1);
        theta2 = this.angleInZeroToTwoPi(theta2);
        if (!this.angleBetween(alpha, theta1, theta2)) {
          const t = theta1;
          theta1 = theta2;
          theta2 = t;
        }

        if (theta1 > theta2) {
          theta1 -= 2 * Math.PI;
        }

        const rangeSize = theta2 - theta1;
        for (let i = 0; i <= n; i++) {
          const angle = theta1 + (i / n) * rangeSize;
          points.push({ x: rMoonPx * Math.cos(angle), y: rMoonPx * Math.sin(angle) });
        }

        // We now need to somewhat repeat this analysis in the Sun frame

        let thetaS1 = Math.atan2((y1 - sunPoint.y) / rSunPx, (x1 - sunPoint.x) / rSunPx);
        let thetaS2 = Math.atan2((y2 - sunPoint.y) / rSunPx, (x2 - sunPoint.x) / rSunPx);
        thetaS1 = this.angleInZeroToTwoPi(thetaS1);
        thetaS2 = this.angleInZeroToTwoPi(thetaS2);
        const alphaS = this.angleInZeroToTwoPi(Math.PI + alpha);
        if (!this.angleBetween(alphaS, thetaS1, thetaS2)) {
          const t = thetaS1;
          thetaS1 = thetaS2;
          thetaS2 = t;
        }

        if (thetaS1 > thetaS2) {
          thetaS1 -= 2 * Math.PI;
        }
        const rangeSizeS = thetaS2 - thetaS1;
        for (let i = 0; i <= n; i++) {
          const angle = thetaS1 + (i / n) * rangeSizeS;
          points.push({ x: rSunPx * Math.cos(angle) + sunPoint.x, y: rSunPx * Math.sin(angle) + sunPoint.y });
        }

      }
      
      

      // We made a translation into the moon's frame, so undo that
      for (let i = 0; i < points.length; i++) {
        points[i].x += moonPoint.x;
        points[i].y += moonPoint.y;
      }

      this.updateMoonTexture();

      const centroidX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const centroidY = points.reduce((s, p) => s + p.y, 0) / points.length;

      // The fact that we're going to re-flip the y axis makes the sign here opposite from what one would expect
      points.sort((p1, p2) => - Math.atan2(p2.y - centroidY, p2.x - centroidX) + Math.atan2(p1.y - centroidY, p1.x - centroidX));

      const locations = points.map(pt => this.findRADecForScreenPoint({ x: pt.x, y: canvasHeight - pt.y }));
      const overlay = new Poly2();
      overlay.set_fill(true);
      const color = "#1F1F1F";
      overlay.set_fillColor(color);
      overlay.set_lineColor(color);
      locations.forEach(pt => overlay.addPoint(pt.ra, pt.dec));
      Annotation2.addAnnotation(overlay);
      
    },


    onWWTRenderFrame(wwtControl: WWTControl) {
      if (this.showNewMobileUI) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (wwtControl._trackingObject !== this.sunPlace) {
          this.trackSun();
          return;
        } 
        return;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.trackingSun = (wwtControl._trackingObject === this.sunPlace) || (this.sunOffset !== null);
        if (this.trackingSun && this.sunOffset !== null) {
          this.trackSunOffset();
        }
      }
    },

    textureFromAssetImage(assetFilename: MoonImageFile): Texture {
      /* eslint-disable @typescript-eslint/no-var-requires */
      return Texture.fromUrl(require(`./assets/${assetFilename}`));
    },

    updateMoonTexture(force=false) {
      let filename: MoonImageFile = "moon.png";
      if (!this.useRegularMoon) {
        // Are we even using showSky?
        const blueMoon = (this.showHorizon && this.showSky) &&
                          this.moonPosition.altRad > 0 ;
        if (!blueMoon) {
          filename = "moon-dark-gray-overlay.png";
        } else {
          let opacityToUse = 100;
          if (this.skyOpacity > 0.8) {
            opacityToUse = 100;
          } else if (this.skyOpacity <= 0.8 && this.skyOpacity >0.7) {
            opacityToUse = 20;
          } else {
            opacityToUse = 10;
          }
          filename = `moon-sky-blue-overlay-${opacityToUse}.png`;
        }
      }
      if (force || (filename !== this.moonTexture && Planets._planetTextures)) {
        Planets._planetTextures[9] = this.textureFromAssetImage(filename);
        this.moonTexture = filename;
      }
    },

    clearPlayingInterval() {
      if (this.playingIntervalId !== null) {
        clearInterval(this.playingIntervalId);
        this.playingIntervalId = null;
      }
    },

    moveOneIntervalForward() {
      this.selectedTime += MILLISECONDS_PER_INTERVAL;
    },

    moveOneIntervalBackward() {
      this.selectedTime -= MILLISECONDS_PER_INTERVAL;
    },

    toUTCDateString(date: Date) {
      // date = new Date(date.getTime() + this.selectedTimezoneOffset) // ignore timezone
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    toUTCTimeString(date: Date) {
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      return `${date.getUTCHours()}:${minuteString} ${ampm}`;
    },

    toLocaleDateString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    toLocaleTimeString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      // get the 12hr time
      const hours = date.getUTCHours() % 12;
      
      return `${hours != 0 ? hours : 12}:${minuteString} ${ampm}`;
    },

    toTimeString(date: Date | null, seconds = false, utc = false) {
      // return this.toLocaleTimeString(date);
      if (date === null) {
        return "";
      }
      
      if (seconds) {
        return formatInTimeZone(date, utc ? 'UTC' : this.selectedTimezone, 'h:mm:ss aaa (zzz)');
      }
      return formatInTimeZone(date, utc ? 'UTC' : this.selectedTimezone, 'h:mm aaa (zzz)');
    },

    closeSplashScreen() {
      this.showSplashScreen = false; 
    },

    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad);
    },

    updateLocationFromMap(location: LocationDeg, addToLocations=true) {
      if (location == null) {
        return;
      }
      this.locationDeg = location;
      this.updateSelectedLocationText();

      if (addToLocations) {
        const visitedLocation: [number, number] = [location.latitudeDeg, location.longitudeDeg];
        if (this.learnerPath === "Clouds" || this.learnerPath === "CloudDetail") {
          this.cloudCoverSelectedLocations.push(visitedLocation);
          this.cloudCoverSelectedCount += 1;
        } else {
          this.userSelectedLocations.push(visitedLocation);
        }
      }
    },

    onTimeSliderChange() {
      this.$nextTick(() => {
        this.updateFrontAnnotations(this.dateTime);
      });
    },

    async createUserEntry() {
      if (this.responseOptOut) {
        return;
      }
      const response = await fetch(`${API_BASE_URL}/solar-eclipse-2026/data/${this.uuid}`, {
        method: "GET",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "" }
      });
      const content = await response.json();
      const exists = response.status === 200 && content.response?.user_uuid != undefined;
      if (exists) {
        return;
      }
      fetch(`${API_BASE_URL}/solar-eclipse-2026/data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Authorization": process.env.VUE_APP_CDS_API_KEY ?? ""
        },
        body: JSON.stringify({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_uuid: this.uuid, 
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_selected_locations: toRaw(this.userSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          cloud_cover_selected_locations: toRaw(this.cloudCoverSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          text_search_selected_locations: toRaw(this.textSearchSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          info_time_ms: 0, app_time_ms: 0, user_guide_time_ms: 0, forecast_info_time_ms: 0,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          advanced_weather_selected_locations_count: this.advancedWeatherSelectedCount,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          cloud_cover_selected_locations_count: this.cloudCoverSelectedCount,
        })
      });
    },

    resetData() {
      this.userSelectedLocations = [];
      this.cloudCoverSelectedLocations = [];
      this.textSearchSelectedLocations = [];
      this.infoTimeMs = 0;
      this.userGuideTimeMs = 0;
      this.weatherTimeMs = 0;
      this.weatherInfoTimeMs = 0;
      this.eclipseTimerTimeMs = 0;
      this.forecastInfoTimeMs = 0;
      this.advancedWeatherSelectedCount = 0;
      this.cloudCoverSelectedCount = 0;
      const now = Date.now();
      this.appStartTimestamp = now;
      this.infoStartTimestamp = this.showInfoSheet ? now : null;
      this.userGuideStartTimestamp = this.showWWTGuideSheet ? now : null;
      this.weatherStartTimestamp = this.showAdvancedWeather ? now : null;
      this.weatherInfoStartTimestamp = this.weatherInfoOpen ? now : null;
      this.eclipseTimerStartTimestamp = this.showEclipsePredictionSheet ? now : null;
      this.forecastInfoStartTimestamp = this.showForecastSheet ? now : null;
    },

    sendUpdateData() {
      if (this.responseOptOut) {
        return;
      }
      const now = Date.now();
      const infoTime = (this.showInfoSheet && this.infoStartTimestamp !== null) ? now - this.infoStartTimestamp : this.infoTimeMs;
      const userGuideTime = (this.showWWTGuideSheet && this.userGuideStartTimestamp !== null) ? now - this.userGuideStartTimestamp : this.userGuideTimeMs;
      const weatherTime = (this.showAdvancedWeather && this.weatherStartTimestamp !== null) ? now - this.weatherStartTimestamp : this.weatherTimeMs;
      const weatherInfoTime = (this.weatherInfoOpen && this.weatherInfoStartTimestamp !== null) ? now - this.weatherInfoStartTimestamp : this.weatherInfoTimeMs;
      const eclipseTimerTime = (this.showEclipsePredictionSheet && this.eclipseTimerStartTimestamp !== null) ? now - this.eclipseTimerStartTimestamp : this.eclipseTimerTimeMs;
      const forecastInfoTime = (this.showForecastSheet && this.forecastInfoStartTimestamp !== null) ? now - this.forecastInfoStartTimestamp : this.forecastInfoTimeMs;
      fetch(`${API_BASE_URL}/solar-eclipse-2026/data/${this.uuid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Authorization": process.env.VUE_APP_CDS_API_KEY ?? ""
        },
        body: JSON.stringify({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_selected_locations: toRaw(this.userSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          cloud_cover_selected_locations: toRaw(this.cloudCoverSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          text_search_selected_locations: toRaw(this.textSearchSelectedLocations),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_info_time_ms: infoTime, delta_app_time_ms: now - this.appStartTimestamp,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_advanced_weather_time_ms: weatherTime, delta_weather_info_time_ms: weatherInfoTime,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_user_guide_time_ms: userGuideTime, delta_eclipse_timer_time_ms: eclipseTimerTime,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_forecast_info_time_ms: forecastInfoTime,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_advanced_weather_selected_locations_count: this.advancedWeatherSelectedCount,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delta_cloud_cover_selected_locations_count: this.cloudCoverSelectedCount,
        }),
        keepalive: true,
      }).then(() => {
        this.resetData();
      });
    },

    logLocation() {
      // console.log(this.location.latitudeRad * R2D, this.location.longitudeRad * R2D);
    },
    
    logPosition() {
      // console.log(this.wwtRARad * R2D, this.wwtDecRad * R2D);
    },

    printUTCDate(date: Date) {
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
    },    

    selectSheet(name: SheetType) {
      if (this.sheet === name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    },

    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
    // https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/wwtlib/Coordinates.cs
    altAzToHADec(altRad: number, azRad: number, latRad: number): { ra: number; dec: number; } {
      azRad = Math.PI - azRad;
      if (azRad < 0) {
        azRad += 2 * Math.PI;
      }
      let ra = Math.atan2(Math.sin(azRad), Math.cos(azRad) * Math.sin(latRad) + Math.tan(altRad) * Math.cos(latRad));
      if (ra < 0) {
        ra += 2 * Math.PI;
      }
      const dec = Math.asin(Math.sin(latRad) * Math.sin(altRad) - Math.cos(latRad) * Math.cos(altRad) * Math.cos(azRad));
      return { ra, dec };
    },

    getJulian(utc: Date): number {
      let year = utc.getUTCFullYear();
      let month = utc.getUTCMonth()+1;
      const day = utc.getUTCDate();
      const hour = utc.getUTCHours();
      const minute = utc.getUTCMinutes();
      const second = utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000.0;

      if (month == 1 || month == 2)
      {
        year -= 1;
        month += 12;
      }

      const a = Math.floor(year / 100);
      const b = 2 - a + Math.floor(a / 4.0);
      const c = Math.floor(365.25 * year);
      const d = Math.floor(30.6001 * (month + 1));

      // gives julian date: number of days since Jan 1, 4713 BC
      const jd = b + c + d + 1720994.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;
      return jd;

    },
    
    mstFromUTC2(utc: Date, longRad: number): number {
      const lng = longRad * R2D;

      const modifiedJD = this.getJulian(utc)  - 2451545;

      const julianCenturies = modifiedJD / 36525.0;
      // this form wants julianDays - 2451545
      let mst = 280.46061837 + 360.98564736629 * modifiedJD + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;

      if (mst > 0.0) {
        while (mst > 360.0) {
          mst = mst - 360.0;
        }
      } else {
        while (mst < 0.0) {
          mst = mst + 360.0;
        }
      }

      return mst;
    },

    horizontalToEquatorial(altRad: number, azRad: number, latRad: number, longRad: number, utc: Date): EquatorialRad {
      const st = this.mstFromUTC2(utc, longRad); // siderial time 
  
      const haDec = this.altAzToHADec(altRad, azRad, latRad); // get Hour Angle and Declination
      
      const ha = haDec.ra * R2D;

      let ra = st + ha;
      if (ra < 0) {
        ra += 360;
      }
      if (ra > 360) {
        ra -= 360;
      }
      // ra -= 180;
      // console.log(`Alt: ${(altRad*R2D).toFixed(2)} Az: ${(azRad*R2D).toFixed(2)} Ra: ${ra.toFixed(2)} Dec: ${(haDec.dec*R2D).toFixed(2)}`)

      return { raRad: D2R * ra, decRad: haDec.dec };
    },

    equatorialToHorizontal(raRad: number, decRad: number, latRad: number, longRad: number, utc: Date): HorizontalRad {
      let hourAngle = this.mstFromUTC2(utc, longRad) - R2D * raRad;
      if (hourAngle < 0) {
        hourAngle += 360;
      }

      const ha = D2R * hourAngle;
      const dec = decRad;
      const lat = latRad;
      
      const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
      const altitude = Math.asin(sinAlt);
      const cosAz = (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) / (Math.cos(altitude) * Math.cos(lat));
      let azimuth = Math.acos(cosAz);

      azimuth = azimuth + (Math.PI * 80) % (Math.PI * 2);

      if (Math.sin(ha) > 0) {
        azimuth = 2 * Math.PI - azimuth;
      }
      return { altRad: altitude, azRad: azimuth };

    },

    createHorizon(when: Date | null = null) {

      const color = '#01362C';
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [-Math.PI / 2, i * delta],
          [0, (i + 1) * delta]
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const poly = new Poly2();
        points.forEach(point => poly.addPoint(...point));
        poly.set_lineColor(color);
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(this.horizonOpacity);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Annotation2.addAnnotation(poly);
      }
    },

    createSky(when: Date | null = null) {
      const color = this.skyColor || '#4190ED';
      // const opacity = 0.5;
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      // const delta = 360/n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [0, (i + 1) * delta],
          [Math.PI / 2, i * delta] // In addition to using +pi/2 instead of -pi/2, I had to switch the order of the 2nd & 3rd points relative to the horizon set. I don't know why, but before I switched them, the polygons didn't render.
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        const poly = new Poly();
        points.forEach(point => poly.addPoint(...point));
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(this.skyOpacity);
        poly.set_lineWidth(0); // This removes the seam that appears between the polygons when opacity < 1
        this.addAnnotation(poly);
      }

    },

    removeAnnotations() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Annotation2.clearAll();
      this.clearAnnotations();
    },    

    onPointerMove(event: PointerEvent) {
      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }
    },

    onPointerDown(event: PointerEvent) {
      this.sunOffset = null;
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
      this.activePointer = true;
    },

    onPointerUp(_event: PointerEvent) {
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
      
      const sunLocation = Planets['_planetLocations'][0];
      const sunPoint = getScreenPosForCoordinates(this.wwtControl, sunLocation.RA, sunLocation.dec);
      this.sunOffset = {
        x: this.wwtControl.renderContext.width / 2 - sunPoint.x,
        y: this.wwtControl.renderContext.height / 2 - sunPoint.y
      };
      this.activePointer = false;
    },


    updateForDateTime() {
      if (this.syncDateTimeWithWWTCurrentTime) {
        this.setTime(this.dateTime);
      }
      this.updateFrontAnnotations(this.dateTime);
      // check if the time is within the range of the eclipse
      // }
    },

    updateFrontAnnotations(when: Date | null = null) {
      try {
        this.removeAnnotations();
      }
      finally {
        this.updateIntersection();
        if (this.showHorizon) {
          this.createHorizon(when);
          if (this.showSky) {
            this.createSky(when);
          }
        }
      }
    },

    updateGuidedContentHeight() {
      let guidedContentContainer = null as HTMLElement | null;
      let height = 0;
      this.$nextTick(() => {
        guidedContentContainer = document.getElementById('guided-content-container') as HTMLElement;
        
        if (guidedContentContainer) {
          height += guidedContentContainer.clientHeight;
        }
        
        const topbanner = document.querySelector('.user-banner');
        if (topbanner) {
          height += topbanner.clientHeight;
        }
        
        this.guidedContentHeight = `${height}px`;
      });
    },
    
    onResize() {
      // get height of #guided-content-container
      this.$nextTick(() => {
        this.updateGuidedContentHeight();
      });
      this.updateGuidedContentHeight();
    },

    startHorizonMode() {
      // turn on local horizon mode
      this.wwtSettings.set_localHorizonMode(true);
      this.showAltAzGrid = false;
      this.skyColor = this.skyColorLight;
      this.showHorizon = true; // automatically calls its watcher and updates horizon
      this.horizonOpacity = 1;
      // this.setForegroundImageByName("Digitized Sky Survey (Color)");
      this.sunPlace.set_zoomLevel(20);
      this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: false,
        trackObject: this.toggleTrackSun
      });
      this.playbackRate = this.horizonRate;
      // console.log('=== startHorizonMode ===');
      return;
    },
  
    getSunAltitudeAtTime(time: Date): { altRad: number; azRad: number; } {
      const sunAltAz = this.equatorialToHorizontal(this.sunPosition.raRad, this.sunPosition.decRad, this.location.latitudeRad, this.location.longitudeRad, time);
      return sunAltAz;
    },

    // function that finds at what time the sun will reach a given altitude during the current day to within 15 minutes
    getTimeforSunAlt(altDeg: number): { rising: number | null; setting: number | null; } {
      // takes about 45ms to run
      // search for time when sun is at given altitude
      // start at 12:00am and search every MINUTES_PER_INTERVAL
      const minTime = this.selectedTime - (this.selectedTime % MILLISECONDS_PER_DAY) - this.selectedTimezoneOffset;
      const maxTime = minTime + MILLISECONDS_PER_DAY;
      // const ehr = this.eclipticHorizonAngle(this.location.latitudeRad, this.dateTime);
      let time = minTime;
      let sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad; // negative
      // find the two times it crosses the given altitude
      while ((sunAlt < altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const rising = time == maxTime ? null : time;
      while ((sunAlt > altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const setting = time == maxTime ? null : time;
      
      return {
        'rising': (rising !== null && setting !== null) ? Math.min(rising, setting) : rising,
        'setting': (rising !== null && setting !== null) ? Math.max(rising, setting) : setting
      };
    }, 
    
    setTimeforSunAlt(altDeg: number) {
      const out = this.getTimeforSunAlt(altDeg);
      // console.log("rise", this.toLocaleDateString(new Date(out.rising as number)) + " " + this.toLocaleTimeString(new Date(out.rising as number)));
      // console.log("set", this.toLocaleDateString(new Date(out.setting as number)) + " " + this.toLocaleTimeString(new Date(out.setting as number)));
      if (out.rising == null && out.setting == null) {
        return;
      }

      function matchTime(time: number | null, times: number[]) {
        if (time === null) {
          return -1;
        }
        const dt = time - times[0];
        return times[0] + dt - (dt % MILLISECONDS_PER_INTERVAL);
      }

      const risingTime = matchTime(out.rising, this.times);
      const settingTime = matchTime(out.setting, this.times);
      if (this.times.includes(risingTime)) {
        this.selectedTime = risingTime;
      } else if (this.times.includes(settingTime)) {
        this.selectedTime = settingTime;
      } else {
        console.log("time not in times array");
        // best to leave it alone so it doesn't jump around
        // this.selectedTime = Math.max(minTime, Math.min(newTime, maxTime));
      }
      

    },

    updateSkyOpacityForSunAlt(altRad: number) {
      const _civilTwilight = -6 * D2R;
      // const _nauticalTwilight = 2 * _civilTwilight;
      const astronomicalTwilight = 3 * _civilTwilight;
      
      const sunAlt = altRad;
      let dssOpacity = 0;
      this.skyOpacity = (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
      let frac = this.currentFractionEclipsed;
      if (this.locationInTotality && !this.inEclipse) {
        frac = frac > 0.98 ? 0.98 : frac;
      }
      this.skyOpacity = this.skyOpacity * (1 - 0.5 * Math.pow(Math.E,-Math.pow((frac -1),2)/(0.001)));
      dssOpacity = sunAlt > 0 ? 0 : 1 - (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
    
      this.updateMoonTexture();

      this.setForegroundOpacity(dssOpacity * 100);
    },

  
    copyShareURL() {
      const baseURL = `${window.location.origin}${window.location.pathname}`;
      const url = `${baseURL}?lat=${this.locationDeg.latitudeDeg}&lon=${this.locationDeg.longitudeDeg}`;
      navigator.clipboard
        .writeText(url)
        .then(() =>
          this.$notify({
            group: "copy-url",
            type: "success",
            text: "URL copied to clipboard. Paste to share with friends!",
            duration: 5000,
            ignoreDuplicates: true
          })
        )
        .catch((_err) =>
          this.$notify({
            group: "copy-url",
            type: "error",
            text: "Failed to copy URL",
            duration: 5000,
            ignoreDuplicates: true
          })
        );
    },

    getCloudCover(lat: number, lon: number): number | null {
      // convert lat/lon to row/col
      const d = this.rectangleDegrees;
      console.log(d, maxLat, minLon, lat, lon);
      const row = Math.round((maxLat - lat) / d);
      const col = Math.round((lon - minLon) / d);
      console.log(row, col);
      if (row < 0 || row >= cloudData.length || col < 0 || col >= cloudData[0].length) {
        return null;
      }
      return cloudData[row][col];
    },
    
    getEclipsePrediction() {
      const eclipsePrediction = recalculateForObserverUTC(this.locationDeg.latitudeDeg, this.locationDeg.longitudeDeg, 100);
      console.log(eclipsePrediction);
      this.eclipsePrediction = eclipsePrediction[0];
      if (this.eclipsePrediction.centralStart[0]) {
        this.eclipseStart = this.eclipsePrediction.centralStart[0].getTime();
      } else if (this.eclipsePrediction.partialStart[0]) {
        this.eclipseStart = this.eclipsePrediction.partialStart[0].getTime();
      } else {
        this.eclipseStart = null;
      }
      
      if (this.eclipsePrediction.centralEnd[0]) {
        this.eclipseEnd = this.eclipsePrediction.centralEnd[0].getTime();
      } else if (this.eclipsePrediction.partialEnd[0]) {
        this.eclipseEnd = this.eclipsePrediction.partialEnd[0].getTime();
      } else {
        this.eclipseEnd = null;
      }
      
      // this means there is not eclipse at this location
      if (this.eclipsePrediction.maxTime[0]) {
        this.eclipseMid = this.eclipsePrediction.maxTime[0].getTime();
      } else {
        this.eclipseMid = null;
      }
      
      switch (this.eclipsePrediction.type) {
      case "T":
        this.eclipseType = "Total";
        break;
      case "A":
        this.eclipseType = "Annular";
        break;
      case "P":
        this.eclipseType = "Partial";
        break;
      default:
        this.eclipseType = "None";
      }
      
      return eclipsePrediction;
      
    },

    findBestFeature(collection: MapBoxFeatureCollection): MapBoxFeature | null {
      const relevantFeatures = collection.features.filter(feature => RELEVANT_FEATURE_TYPES.some(type => feature.place_type.includes(type)));
      const placeFeature = relevantFeatures.find(feature => feature.place_type.includes("place")) ?? (relevantFeatures.find(feature => feature.place_type.includes("postcode")) ?? undefined);
      if (placeFeature !== undefined) {
        return placeFeature;
      }
      const regionFeature = relevantFeatures.find(feature => feature.place_type.includes("region"));
      if (regionFeature !== undefined) {
        return regionFeature;
      }
      const countryFeature = relevantFeatures.find(feature => feature.place_type.includes("country"));
      if (countryFeature !== undefined) {
        return countryFeature;
      }
      return null;
    },

    textForMapboxFeature(feature: MapBoxFeature): string {
      const pieces: string[] = [];
      if (feature.text) {
        pieces.push(feature.text);
      }
      feature.context.forEach(item => {
        const itemType = item.id.split(".")[0];
        if (!RELEVANT_FEATURE_TYPES.includes(itemType)) {
          return;
        }
        let text = null as string | null;
        const shortCode = item.short_code;
        if (itemType === "region" && shortCode != null) {
          if (NA_ABBREVIATIONS.some(abbr => shortCode.startsWith(abbr))) {
            text = shortCode.substring(3);
          }
        } else if (itemType === "country") {
          const itemText = item.text;
          if (!NA_COUNTRIES.includes(itemText)) {
            text = itemText; 
          }
        }
        if (text !== null) {
          pieces.push(text);
        }
      });
      return pieces.join(", ");
    },

    textForMapboxResults(results: MapBoxFeatureCollection): string {
      const feature = this.findBestFeature(results);
      if (feature === null) {
        return "";
      }
      return this.textForMapboxFeature(feature);
    },
    
    async textForLocation(longitudeDeg: number, latitudeDeg: number): Promise<string> {
      const accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitudeDeg},${latitudeDeg}.json?access_token=${accessToken}`;
      const mapBoxText = await fetch(url)
        .then(response => response.json())
        .then((result: MapBoxFeatureCollection) => {
          if (result.features.length === 0) {
            return null;
          }
          return this.textForMapboxResults(result);
        })
        .catch((_err) => {
          this.searchErrorMessage = "An error occurred while searching";
        });
      if (mapBoxText) {
        return mapBoxText;
      } else {
        const ns = this.locationDeg.latitudeDeg >= 0 ? 'N' : 'S';
        const ew = this.locationDeg.longitudeDeg >= 0 ? 'E' : 'W';
        const lat = Math.abs(this.locationDeg.latitudeDeg).toFixed(3);
        const lon = Math.abs(this.locationDeg.longitudeDeg).toFixed(3);
        return `${lat}° ${ns}, ${lon}° ${ew}`;
      }
    },

    async geocodingInfoForSearch(searchText: string): Promise<MapBoxFeatureCollection | null> {
      const accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${accessToken}&types=place,postcode`;
      return fetch(url)
        .then(response => response.json())
        .then((result: MapBoxFeatureCollection) => {
          return result;
        })
        .catch((_err) => null);
    },
    

    setLocationFromFeature(feature: MapBoxFeature) {
      this.locationDeg = { longitudeDeg: feature.center[0], latitudeDeg: feature.center[1] };
      this.textForLocation(feature.center[0], feature.center[1]).then((text) => {
        this.selectedLocationText = text;
      });
    },

    setLocationFromSearchFeature(feature: MapBoxFeature) {
      this.setLocationFromFeature(feature);
      this.textSearchSelectedLocations.push(feature.center);
      if (this.showNewMobileUI) {
        setTimeout(() => {
          this.searchOpen = false;
        }, 3_000);
      }
    },
    
    reversePlaybackRate() {
      this.forceRate = false;
      const sign = Math.sign(this.playbackRate);
      if (sign > 0 ) {
        this.playbackRate = -Math.min(this.playbackRate,1);
        return;
      }
      const abs = Math.abs(this.playbackRate);
      let ezrate = Math.floor(Math.log10(abs));
      ezrate -= sign * 1;
      this.playbackRate = sign * Math.pow(10, Math.abs(ezrate));
    },
    
    increasePlaybackRate() {
      this.forceRate = false;
      if (Math.sign(this.playbackRate) < 0 ) {
        this.playbackRate = -Math.max(this.playbackRate,-1);
        return;
      }
      const sign = Math.sign(this.playbackRate);
      const abs = Math.abs(this.playbackRate);
      let ezrate = Math.floor(Math.log10(abs));
      ezrate += sign * 1;
      this.playbackRate = sign * Math.pow(10, Math.abs(ezrate));
    },
    
    async updateSelectedLocationText() {
      this.selectedLocationText = await this.textForLocation(this.locationDeg.longitudeDeg, this.locationDeg.latitudeDeg);
    },

    niceRound(val: number) {
      // rounding routine specifically for the playback rate
      const abs = Math.abs(val);
      
      if (abs < 2.7) {
        return val.toFixed(1);
      }
      
      if (abs < 35) {
        return val.toFixed(0);
      }
      
      if (abs < 255) {
        return Math.round(val / 10) * 10;
      }
      
      return Math.round(val / 100) * 100;
    }
  },

  watch: {

    playingWaitCount(val: number, old: number) {
      console.log(`Playing wait count: ${old} ---> ${val}`);
    },
    
    showNewMobileUI(_val: boolean) {
      this.updatePanForMobile(); 
    },

    showGuidedContent(show: boolean) {
      this.onResize();
      this.$nextTick(() => {
        this.onScroll();
      });
      if (show) {
        if (this.narrow) {
          this.pauseForOverlay();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.$refs.showGuidedContent as any).tooltip = false;
        const element = document.activeElement;
        if (element && element.id === "show-guided-content-button") {
          (element as HTMLElement).blur();
        }
      } else if (this.narrow) {
        this.playForOverlay();
      }
    },
    
    showEclipsePredictionTextBanner(_val: boolean) {
      this.onResize();
      this.$nextTick(() => {
        this.onScroll();
      });
    },

    cssVars(_css: unknown) {
      // console.log(_css);
    },
    
    responseOptOut(optOut: boolean) {
      window.localStorage.setItem(OPT_OUT_KEY, String(optOut));
    },

    inIntro(value: boolean) {
      if (!value) {
        this.playing = true;
        this.showEclipsePredictionTextBanner = true;
        if (!this.showSplashScreen && this.responseOptOut === null) {
          this.showPrivacyDialog = true;
        }
      }
    },

    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },

    showHorizon(_show: boolean) {
      this.updateFrontAnnotations();
      this.updateMoonTexture();
    },

    showSky(_show: boolean) {
      this.updateFrontAnnotations();
      this.updateMoonTexture();
    },

    wwtZoomDeg(_zoom: number, _oldZoom: number) {
      this.sunOffset = null;
      this.updateIntersection();
    },

    useRegularMoon(_show: boolean) {
      this.updateMoonTexture();
      this.updateFrontAnnotations(this.dateTime);
    },

    dateTime(_date: Date) {
      this.updateForDateTime();
    },

    selectedTime(_time: number) {
      return;
    },
    
    nearTotality(near: boolean, oldNear: boolean) {
      if (near) {
        this.forceRate = (Math.abs(this.playbackRate) > 10) && this.playing;
      }
      
      // if leaving eclipse reset speed to previous
      if (oldNear && !near) {
        this.forceRate = false;
      }
    },


    wwtCurrentTime(time: Date) {
      
      if (this.forceRate && !this.nearTotality && (this.eclipsePhase === 'after' || this.eclipsePhase === 'before')) {
        this.forceRate = false;
      }

      if (time.getTime() >= this.maxTime || time.getTime() < this.minTime) {
        if (this.playing) {
          this.playing = false;
          this.selectedTime = this.minTime;
        }
        
        return;
      }
      this.updateFrontAnnotations(time);
    },

    learnerPath(path: LearnerPath) {
      if (!this.visitedCloudCover && ((path === "Clouds") || (path === "CloudDetail"))) {
        this.cloudCoverSelectedLocations.push([this.locationDeg.latitudeDeg, this.locationDeg.longitudeDeg]);
        this.cloudCoverSelectedCount += 1;
        this.visitedCloudCover = true;
      }
    },

    location(loc: LocationRad, oldLoc: LocationRad) {
      const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
      
      if (oldLoc.latitudeRad * loc.latitudeRad < 0) {
        Grids._altAzTextBatch = null;
      }

      this.selectedTimezone = tzlookup(...locationDeg);
      this.playing = false;
      // this.sunOffset = null;
      this.updateWWTLocation();

      // We need to let the location update before we redraw the horizon and overlay
      // Not a huge fan of having to do this, but we really need a frame render to update e.g. sun/moon positions
      this.wwtControl.renderOneFrame();
      this.getEclipsePrediction();
      this.updateFrontAnnotations();

      
      if (this.trackingSun) {
        //this.centerSun();
      } else {
        this.trackSunOffset();
      }
    },

    playing(play: boolean) {
      console.log(`${play ? 'Playing:' : 'Stopping:'} at ${this.playbackRate}x real time`);
      this.setClockSync(play);
      
      if (this.nearTotality && play) {
        this.forceRate = (Math.abs(this.playbackRate) > 10);
      }
      
    },

    showSplashScreen(val: boolean) {
      if (!val) {
        this.inIntro = true; 
        if (this.showNewMobileUI) {
          this.introSlide = 2;
        }
      }
    },

    showInfoSheet(show: boolean) {
      // Keep track of how long the user has the book open/closed
      if (show) {
        this.infoStartTimestamp = Date.now();
        this.pauseForOverlay();
      } else if (this.infoStartTimestamp !== null) {
        this.infoTimeMs += (Date.now() - this.infoStartTimestamp);
        this.infoStartTimestamp = null;
      }
      
      if (!show) {
        this.playForOverlay();
      }
      
    },

    showAdvancedWeather(show: boolean) {
      if (show) {
        this.weatherStartTimestamp = Date.now();
        this.pauseForOverlay();
      } else if (this.weatherStartTimestamp !== null) {
        this.weatherTimeMs += (Date.now() - this.weatherStartTimestamp);
        this.weatherStartTimestamp = null;
      }
      
      if (!show) {
        this.playForOverlay();
      }
    },

    showWWTGuideSheet(show: boolean) {
      if (show) {
        this.userGuideStartTimestamp = Date.now();
        this.pauseForOverlay();
      } else if (this.userGuideStartTimestamp !== null) {
        this.userGuideTimeMs += (Date.now() - this.userGuideStartTimestamp);
        this.userGuideStartTimestamp = null;
      }
      
      if (!show) {
        this.playForOverlay();
      }
    },

    showEclipsePredictionSheet(show: boolean) {
      if (show) {
        this.pauseForOverlay();
        this.eclipseTimerStartTimestamp = Date.now();
      } else if (this.eclipseTimerStartTimestamp !== null) {
        this.eclipseTimerTimeMs += (Date.now() - this.eclipseTimerStartTimestamp);
        this.eclipseTimerStartTimestamp = null;
      }
      
      if (!show) {
        this.playForOverlay();
      }
    },

    showForecastSheet(show: boolean) {
      if (show) {
        this.pauseForOverlay();
        this.forecastInfoStartTimestamp = Date.now();
      } else if (this.forecastInfoStartTimestamp !== null) {
        this.forecastInfoTimeMs += (Date.now() - this.forecastInfoStartTimestamp);
        this.forecastInfoStartTimestamp = null;
      }

      if (!show) {
        this.playForOverlay();
      }

    },

    weatherInfoOpen(open: boolean) {
      if (open) {
        this.weatherInfoStartTimestamp = Date.now();
        this.pauseForOverlay();
      } else if (this.weatherInfoStartTimestamp !== null) {
        this.weatherInfoTimeMs += (Date.now() - this.weatherInfoStartTimestamp);
        this.weatherInfoStartTimestamp = null;
      }
      
      if (!open) {
        this.playForOverlay();
      }
    },
    
    showPrivacyDialog(show: boolean) {
      if (show) {
        this.pauseForOverlay();
      } else {
        this.playForOverlay();
      }
    },
    
    introSlide(val: number) {
      this.inIntro = val < 3;
      return;
    },

    viewerMode(mode: ViewerMode) {
      if (mode === 'Horizon') {
        this.startHorizonMode();
      } 
      this.updateSkyOpacityForSunAlt(this.sunPosition.altRad);
      this.updateMoonTexture();
    },

    skyColor(_color: string) {
      this.updateFrontAnnotations();
    },

    sunAboveHorizon(isAbove: boolean) {
      // console.log(`The sun is ${isAbove ? 'above' : 'below'} the horizon`);
      // this.showSky = isAbove; // just turn it off
      this.horizonOpacity = isAbove ? 1 : 0.85;
    },

    sunPosition(pos: EquatorialRad & HorizontalRad) {

      this.updateSkyOpacityForSunAlt(pos.altRad);
      return;
    },
    
    currentFractionEclipsed(_frac: number) {
      // this.skyOpacity = 1 - frac;
      this.updateSkyOpacityForSunAlt(this.sunPosition.altRad);
      this.updateFrontAnnotations();
    },

    toggleTrackSun(val: boolean) {
      if (val) {
        this.trackSun();
        if(this.sunOffset === null) {
          this.sunCenteredTracking = true;
          return;
        } else {
          return;
        }
      } else {
        this.sunCenteredTracking = false;
        const currentPlace = new Place();
        currentPlace.set_RA(this.wwtRARad * R2D / 15);
        currentPlace.set_dec(this.wwtDecRad * R2D);
        this.gotoTarget({
          place: currentPlace,
          instant: true,
          noZoom: true,
          trackObject: false
        });
        return;
      }
    },

    sunOffset(val: {x: number, y: number}) {
      if (val === null && this.toggleTrackSun) {
        this.sunCenteredTracking = true;
        return;
      } else {
        this.sunCenteredTracking = false;
        return;
      }
    },
    
    playbackRate(val: number) {
      if (Math.abs(val) > 11_000) {
        console.warn('playbackRate too high, setting to maxPlaybackRate');
        this.playbackRate = Math.sign(val) * 10_000;
      }
      
      this.setClockRate(val === 1 ? 1 : val - 1 + 0.000000001 );
    },
    

  },
});
</script>


<!-------------------------  STYLE ----------------------------->
<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
  --time-content-max-width: 700px;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  
  overflow: hidden;
  overflow-y: hidden !important; 
  -ms-overflow-style: none;

  // We don't want a scrollbar for the overall canvas
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: var(--default-font-size);
}

.leaflet-grab {
      cursor: cell;
    }
    
.leaflet-dragging .leaflet-grab {
  cursor: all-scroll;
}

.v-chip {
  border: none;
  color: blue;
  background-color: white;
  opacity: 1;
  padding: 0.5em;
}  

.user-banner {
  position: relative;
  font-size: calc(0.8 * var(--default-font-size));
  text-align: center;
  background-color: rgb(93, 93, 93);
  
  .banner-close {
    position: absolute;
    right: 5px;
    cursor: pointer;
  }
}


#main-content {
  position: relative;
  // top: var(--top-content-height);
  width: 100%;
  height: calc(var(--app-content-height) - var(--top-content-height) - 1px);
  overflow: hidden;
  // border: 2px solid blue;

  // transition: height 0.1s ease-in-out;
  .icon-wrapper {
    -webkit-user-select:none;
    -moz-user-select:none;
    user-select: none;
  }

  #my-location-button {
    border-width: 2px;
  }

  .location-search-overwwt {
    z-index: 600;
  }
  
  #center-page-banner {
    position: absolute;
    width: 25%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    pointer-events: none;
    
    margin-left: 1rem;
    
    padding-block: 0.7rem;
    padding-inline: 1rem;
    background-color: rgba(0, 0, 0, 0.7);
    font-size: calc(1.5 * var(--default-font-size));
    font-weight: bold;
    color: #888888;
    text-align: center;
    border-radius: 10px;

    @media (max-width: 600px) {
      width: 35%;
      top: 65%;
      margin-left: 3%;
      padding-block: 2%;
      padding-inline: 3%;
      font-size: calc(1.2 * var(--default-font-size));
    }

    @media (orientation: landscape) {
      top: 50%;
      margin-left: 8%;
      font-size: calc(1.1 * var(--default-font-size));
    }
    
  }
  
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  position: relative;

  .wwtelescope-component {
    position: relative;
    // top: 0;
    width: 100%;
    height: 100%;
    // border-style: none;
    // border-width: 0;
    // border: 3px solid red;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#modal-readytostart {
  cursor: pointer;
  color: #999;

  &:hover {
    color: #2aa5f7;
  }

  div {
    margin: 0;
    padding: 0;
    background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/logos/wwt_globe_bg.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    width: 20rem;
    height: 20rem;
    max-width: 70%;
    max-height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 60%;
      height: 60%;
      margin-left: 14%;
      margin-top: 3%;
    }
  }
}

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

}

// these are now in #top-content

#left-buttons-wrapper {
  position: absolute;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: fit-content;
  
  @media (max-width: 599px) {
    top: 2.5rem;
  }

  @media (min-width: 600px) {
    top: 0.7rem;
  }

  &.budge {
    left: 0.5rem;

    @media (max-width: 599px) {
      top: 4.8rem;
    }

    @media (min-width: 600px) {
      top: 3.5rem;
    }
  }
  
  .icon-wrapper {
    padding-inline: 0.5em;
    padding-block: 0.6em;
  }

  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
  }
  
  .icon-wrapper:not(#my-location-button) {
    border: 2px solid var(--accent-color);
  }
}



#location-progress {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 2.5rem;

  
}

.url-notification {
  margin-top: 45vh;
  border-radius: 5px;
  font-size: calc(1.1 * var(--default-font-size));
  padding: 1em;

  &.success {
    background-color: #9a009a;
  }
  &.error {
    background-color: #b30000;
  }
}

.top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  #center-buttons {
    display: flex;
    flex-direction: row;
  }
}

.bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: auto;
  bottom: 1rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  align-items: flex-end;
  gap: 10px;
  // outline: 1px solid lime;
}

#tools {
  z-index: 10;
  color: #fff;
  width: 100%;
  gap: 5px;

  .opacity-range {
    width: 50vw;
  }

  .clickable {
    cursor: pointer;
  }

  select {
    background: white;
    color: black;
    border-radius: 3px;
  }
}

#set-time-now-button {
  // position: absolute;
  // bottom: 15%;
  // left: 5%;
  margin-left: 3%;
  background-color: black !important;
  pointer-events: auto;
  border: solid 2px;
}

.tool-container {
  display: flex;
  width: 99%;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: auto;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }

  div.icon-wrapper {
    padding: 5px 5px;
    min-width: 30px;
  }
  
}



#controls {
  background: black;
  padding-block: 0.5em;
  padding-right: 0.5em;
  border-radius: 5px;
  border: solid 1px var(--accent-color);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  align-self: flex-start;

  .v-label {
    color: var(--accent-color);
    opacity: 1;
    font-size: var(--default-font-size);
    margin-left: 0.5em;
  }

  #control-checkboxes {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-left: calc(0.5 * var(--default-line-height));

    .v-checkbox .v-selection-control {
      font-size: calc(1.1 * var(--default-font-size));
      height: calc(1.2 * var(--default-line-height));
      min-height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__input {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__wrapper {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      white-space: break-spaces;
      width: 150px;
    }
  }
  #controls-top-row {
    padding-left: 0.5em;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#show-controls {
  color: var(--accent-color);
}

#text-credits {
  margin-block: 1rem;
  width: 100%;
  color: #ddd;
  font-size: calc(1.1 * var(--default-font-size));
  line-height: calc(1.1 * var(--default-line-height));
  display: flex;
  flex-direction: column;
  text-align: left;

  h4 {
    margin-top: 0.6rem;
    margin-bottom: 0.3rem;
  }
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

#splash-overlay {
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
  
  &.new-mobile-ui {
    font-size: clamp(10px,min(8vw, 7vh), 45px);
  }
}

#splash-screen {
  color: var(--moon-color);

  @media (max-width: 699px) {
    max-height: 90vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 90vh;
    max-width: min(90vw, 800px);
  }

  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;
  padding-top: 4vh;
  padding-bottom: 1vh;

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;

  div {
    margin-inline: auto;
    text-align: center;
  }
  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: normal;
    vertical-align: middle;
  }
    
  p.highlight {
    color: var(--accent-color);
    text-transform: uppercase;
    font-weight: bolder;

    @media (max-width: 750px) {
      font-weight: bold;
    }
  }

  span.highlight {
    color: var(--accent-color);
    font-weight: bold;
  }
  
  p.small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    position: absolute;
    top: 0.5rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    line-height: 110%;
    margin-inline: 5%;

    @media (max-width: 600px) {
      line-height: 125%;
    }
  }

  .splash-get-started {
    border: 2px solid white;
    font-size: calc(1.8 * var(--default-font-size));
    margin-top: 5%;
    margin-bottom: 2%;
    font-weight: bold !important;
  }

  .splash-small-text {
    margin-top: 5%;
    font-size: calc(1.4*var(--default-font-size));    
    font-weight: 300;
  }

  #splash-screen-acknowledgements {
    margin-bottom: 5%;
    font-size: calc(1.4 * var(--default-font-size));
    line-height: calc(1.2 * var(--default-line-height));
    width: 80%; 
  }

  img.eclipse-ds-logo {
    height: 20vmin;
    margin-bottom: 2px;
  }
}

#video-icon {
  display: none;  // ACTION NEEDED - reenable this when we have a video
  position: absolute;
  left: 0.5rem;
  width: 2.2rem;

  @media (max-width: 699px) {
    bottom: 3rem;
  }

  @media (min-width: 700px) {   
    bottom: 6rem;
  }

  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }
}

.video-wrapper {  
  display: flex;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  text-align: center;
  z-index: 1000;
}

video, #info-video {
  margin: auto;
  height: 85%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  // aspect-ratio: 9/17;
  border: 5px solid white;
}

#video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 1000;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 15;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border: 2px solid white;
  }
}

#overlay-close {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  font-size: calc(1.5 * var(--default-font-size));
  display: flex;
  flex-direction: column;
  color: #888888;


}


.overlay-close-icon {
  z-index: 15;
  left: 50%;
  transform: translateX(-50%);
  font-size: calc(2.5*var(--default-font-size));
  color: #888888;
}

.bottom-sheet {

  .tab-title {
    font-size: calc(1.2 * var(--default-font-size));
  }

  #learn-more-content{
    display: flex;

    @media (max-width: 959px ) {
      flex-direction: column;
    }

    @media (min-width: 960px ) {
      flex-direction: row;
    }

  }

  #info-text-box {
    font-size: var(--default-font-size);
    line-height: var(--default-line-height);

    @media (min-width: 960px ) {
      min-width: 50%;
      padding-right: 1em;
    }
  }
  #main-info-text {
    padding-inline: 0.5em;
  }

  #safety-warning{
    margin-top: 0.4em;
    font-weight: bold;
    color: var(--accent-color);
    font-size: calc(1.2 * var(--default-font-size));
    line-height: calc(1.2 * var(--default-line-height));
  }
  
  #FAQ{
    margin-top: 1em;

    details {
      padding-block: 0.7em;
      padding-inline: 1.2em;
      height: fit-content;
      background-color: #38464f;
      
      summary {
        font-weight: bold;
        cursor: pointer;
      }
      
      p {
        padding-top: 0.5em;
        padding-inline: 1em;
      }
    
    }
  }
  
  
  figure {
    // make it stick in the viewport
    position: sticky;
    height: 100%;
    padding-top: 1em;

    @media (max-width: 960px ) {
      width: 100%;
    }

    @media (min-width: 960px ) {
      width: 50%;
    }

    flex-shrink: 0;
    top: 0;
    margin-top: 1em;

    figcaption{
      bottom: -2em;
      right: 0;
      font-size: calc(0.8 * var(--default-font-size));
      line-height: calc(0.8 * var(--default-line-height));
      background-color: rgba(0, 0, 0, .33);
      padding-inline: 10px 5px;
    }
    
    .disclaimer {
      position: absolute;
      font-size: calc(0.8 * var(--default-font-size));
      top: 2em;
      right: 1em;
      font-weight: bold;
    }
    
  }
  
  .v-overlay__content {
    align-self: center;
    padding: unset;
    margin: unset;
  }
  
  .bottom-sheet-card {
    height: fit-content;
    width: 100%;

    align-self: center;
    border-bottom: solid #212121 0.5em;
  }
  
  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }
  
  .v-card-title {
    display: flex;
    justify-content: center;
    align-self: stretch;
    border-bottom: 2px solid var(--accent-color);
    
    h3 {
      color: var(--accent-color);
      align-self: center;
      text-transform: uppercase;
      font-weight: bold;
    }
  }

  .v-card-text {
    height: 40vh;
  }

  .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }

  .scrollable {
    overflow-y: auto;
  }

  .no-bottom-border-radius {
    // border-bottom-left-radius: 0px !important;
    // border-bottom-right-radius: 0px !important;
    width: auto;
    height: fit-content;
    max-height: 50vh;
    
    @media (max-width: 700px ) {
      max-height: 70vh;
    }
    
  }
  

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: var(--accent-color);
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }

  #user-guide {
    font-size: var(--default-font-size);
    line-height: calc(1.1 * var(--default-line-height));

    .v-chip {
      color: unset;
      background-color: unset;
      // font-size: var(--default-font-size);
    }

    .user-guide-header {
      margin-top: 1rem;
      color: var(--accent-color);
      font-size: calc(1.2 * var(--default-font-size));
    }

    .user-guide-emphasis {
      color: var(--accent-color);
      font-weight: bold;
    }

    .user-guide-emphasis-white {
      font-weight: bold;
    }
    
    li.switch-bullets {
      margin-top: -1em;

      padding-left: 0.5ch;
      .v-switch {
        transform: translateY(15%);
      }

      .user-guide-emphasis {
        padding-left: 1ch;
      }
    }

    .display-only-switch {
    
      display: inline-block;
      position: relative;
      bottom: calc(-0.5 * var(--default-line-height));

      .v-selection-control--density-default {
        --v-selection-control-size:var(--default-line-height);
      }

      .v-selection-control--disabled {
      opacity: 100%;
      pointer-events: none;

        .v-switch__thumb {
          background-color: black;
        }

        .v-icon {
          color: var(--accent-color);
          background-color: black;
        }
      }
    }

    .solid-divider {
      margin-top: 1rem;
      color: var(--sky-color);
      opacity: 0.7;
    }
  }
}

#body-logos {
  margin-left: auto;
  margin-right: 0;

  img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
  }
}

// Styling the slider
#slider .v-slider {
  .v-slider-track {
    // --v-slider-track-size: 4px !important;

    .v-slider-track__background {
      background-color: #CCC !important;
    }

    .v-slider-track__fill {
      background-color: rgb(255 193 203)!important;
      height: var(--v-slider-track-size) !important;
    }

    .v-slider-track__background--opacity {
      opacity: 1 !important;
    }
  }

  .v-slider-thumb {
    
    .v-slider-thumb__surface {
      border: 1px solid black !important;
    }
  }
  

  .v-slider-thumb__label {
    min-width: fit-content;
    white-space: nowrap;
    color: black;
    padding-inline: 0.7rem;
    background-color: var(--accent-color);

    font-size: var(--default-font-size);
    padding-block: calc(0.5 * var(--default-line-height));

    @media (max-width: 600px) {
      font-size: calc(1 * var(--default-font-size));
      padding-block: 0;
      padding-inline: 0.3rem;
      height: 15px;
    }
  }
  
  .v-slider-thumb__label::before {
    color: var(--accent-color);
  }
}

#slider {
  width: 100% !important;
  margin-left: 5px;
  margin-right: 0;
  position: relative
  
}

.v-container {
  max-width: 100%;
}

#closed-top-container {
    position: absolute;
    left: 1.5rem;
    z-index: 500;
    top: calc(var(--default-font-size) + 1px);
    
    &.open > .icon-wrapper {
      --color: var(--accent-color)  !important;
      --background-color: transparent !important;
      border: none;
      border-radius: 2px;
      padding: 4px;
    }
    
    // &.open > .icon-wrapper:hover {
    //   --color: var(--sky-color)  !important;
    // }


    &.budge {
      left: 0.5rem;
      @media (max-width: 599px) {
        left: 0.5rem;
      }
    }
  }

#guided-content-container {  
  --top-content-max-height: max(30vmin, 35vh);
  --top-content-min-height: 200px;
  z-index: 400;
  
  @media (max-width: 600px) {
    --top-content-max-height: calc(100% - 1rem);
    --top-content-min-height: calc(100% - 1rem);
    box-sizing: border-box;
  }
  
  font-size: var(--default-font-size);
  @media (max-width: 350px) and (max-height: 600px) {
      font-size: min(3vw, 1.75vh);
  }
  
  --map-max-height: var(--top-content-max-height); // Keep this about 3 smaller than above // not used any more
  --margin: 0.5rem;
  --container-padding: 0.5rem;
  position: relative;
  margin: var(--margin);
  padding: var(--container-padding);

  width: calc(100% - 2*var(--margin));
  max-height: var(--top-content-max-height);
  min-height: var(--top-content-min-height);
  align-items: center;
  gap: 0.5rem;
  // border-bottom: 1px solid var(--accent-color);
  background-color: #272727;
  user-select: none;
  border: solid 1.5px var(--accent-color);
  
  line-height: var(--default-line-height);
  overflow-y: scroll;
  
  transition: height 0.5s ease-in-out;
  
  display: flex;
  flex-direction: row;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
  
  
  span.highlighted {
    font-weight: bold;
    padding-inline: 0.5em;
    border-radius: 0.25em;;
  }
  
  #scrollButton-button {
    position: fixed;
    top: calc(var(--top-content-height) - 2.5rem);
    right: 1rem;
    z-index: 1000;
  }

  #non-map-container {
    flex-basis: 100%;
    @media (max-width: 600px) {
      flex-basis: fit-content;
    }
  }
    
  #map-column {
    flex-basis: 100%;
    
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
  
  


  #non-map-container { // Keep content away from the x to close
    height: 100%;
    --padding-left: 0.5rem;
    // @media (max-width: 600px) {
    //   --padding-left: 0;
    // }
    padding-left: var(--padding-left);
    padding-right: calc(var(--padding-left) + var(--container-padding));
    
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: stretch;
    gap: 0.5em;
    
    position: relative;
    
    .non-map-row {
      margin: 0;
      padding: 0;
    }
  
  }
    
    // .v-row.non-map-row#title-row
  #title-row {
    color: var(--accent-color);
    font-weight: bold;
    text-align: right;
    font-size: 1.3em;

  }
  
  .v-btn#toggle-instruction-text {
    position: absolute;
    right: 1.8em;
    top: 2.3em;
    color: var(--accent-color)
    // transform: translate(-25%, 75%);
  }
    
    // .v-row.non-map-row#instructions-row
  #instructions-row { 
    max-height: 70%;
    display: flex;
    border: 1.5px solid var(--sky-color);
    border-radius: 5px;
    align-items: center;
    justify-content: space-evenly;
    
    @media (max-width: 600px) {
      max-height: unset;
    }
    
    // v-col
    #top-container-main-text { 
      max-height: 100%;
      display: flex;
      flex-direction:column;

    
      // div
      .instructions-text {
        min-width: 40vw;
        flex: 1;
        width: 100%;
        overflow-y: scroll;
        
        padding-inline: 0.7em;
        padding-block: 0.4em; // this plus the margin on p give .7 em on top and bottom

        // span
        .description {
          line-height: 1.4em;
          color: white;
          text-align: left;
          user-select: text;
          
          p {
            margin-block: .3em;
          }
        }

      }

      #info-text-button {
          margin-right: 0.1rem;
          margin-block: 0.1rem;

          .v-btn--size-default{
          font-size: var(--default-font-size) !important;
        }
      }
    }
  }

  #button-row {
    width: 100%;

    #top-container-buttons{
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      gap: 0.5em;
            
      .icon-wrapper {
        background-color: rgba(209, 209, 209, .2);
        border: none;
        border-radius: 5px;
        padding-block: 4px;
        // be as large as you can but shrink if needed
        width: 100%;
        flex-shrink: 1;
        

        &.active {
          border: 2px solid var(--sky-color);

          
        }
      }
    }
  }


}

#map-column { // v-col
  position: relative;
  --map-max-height: calc(var(--top-content-max-height) - 2*var(--margin) - 2*var(--container-padding));
  height: 100%;
  width: 100%;
  // outline: 1px solid red;
  @media (max-width: 600px) {
      aspect-ratio: 5/3;
    }
  

  #map-container {
    height: 100%;
    width: 100%;
    
    display: flex;
    
    .show-after {
      display:flex;
      width: 100%;
      min-height: 2.5em;
      height: max-content;
      align-items: center;
      justify-content: center;
      font-size: calc(0.9 * var(--default-font-size));
      padding: 0 10px;
      position: absolute;
      top: 0;
      left: 0;
      
      @media (max-width: 600px) {
        font-size: calc(1.1 * var(--default-font-size));
      }
      
      color: black;
      background-color: #cccccc77;
      z-index: 500;
      
      backdrop-filter: blur(5px) saturate(50%);
      
      
      .banner-close {
        position: absolute;
        right: 5px;
        cursor: pointer;
      }
      
    }
    
    
    &.show-after::after {
      content: attr(data-before-text);
      
      display:flex;
      width: 100%;
      min-height: 2.5em;
      height: max-content;
      align-items: center;
      justify-content: center;
      font-size: calc(0.8 * var(--default-font-size));
      padding: 0 10px;
      position: absolute;
      top: 0;
      left: 0;
      
      color: black;
      background-color: #cccccc77;
      z-index: 500;
      
      backdrop-filter: blur(5px) saturate(50%);
    }

    .location-search-overmap {
      height: fit-content;
      position: absolute;
      z-index: 600;
      right: 1.25em;
      top: 1em;
      
      &.overmap-low {
        top: 2em;
      }
      
      
      &.overmap-budge {
        right: 4.5em;
      }
    }

    #my-location-overmap-button {
      height: fit-content;
      position: absolute;
      z-index: 550;
      right: 1.25em;
      bottom: 1rem;
      
    }
    
    #my-location-overmap-budge-button {
      height: fit-content;
      position: absolute;
      z-index: 550;
      right: 4.5em;
      bottom: 1rem;
      
    }
    

    
    #eclipse-details-overmap-button {
      height: fit-content;
      position: absolute;
      z-index: 600;
      bottom: 1rem;
      left: 1rem;
    }
    
    .map-container {
      height: 100%;
      width: 100%;
      aspect-ratio: 5/3;
    }
  
    span {
      padding: 0;
      margin: 0;
    }
    
    #eclipse-path-map > img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      // position: absolute;
      // top: 50%;
      // left: 50%;
      // transform: translateX(-50%) translateY(-50%);
      
      
    }

    .leaflet-control-zoom-in, .leaflet-control-zoom-out {

      background-color: #fff;
      cursor: pointer; /* Change cursor on hover */
      
      span {
        color: black;
      }
    } 

    .leaflet-touch {
      line-height: 1;
    }
    
    .leaflet-control-attribution {
      font-size: .75em;
    }
    
    .leaflet-pane.leaflet-overlay-pane > svg > g > path[fill="#333"] {
      pointer-events: none;
    }
    
    .leaflet-pane.leaflet-overlay-pane > svg > g > path[fill="#ff0000"] {
      pointer-events: none;
    }
  }
}

.bullet-icon {
  color: var(--accent-color);
  width: 1.5em;
}

#intro-window-close-button {
    position: absolute;
    top: 0.25em;
    right: 0.25em;

    &:hover {
      cursor: pointer;
    }
}

#instruction-overlay {
  
  --width: 80dvw;
  // --height: 60dvh;
  position: relative;
  // top: 7rem;
  

  --height: 50dvh;
  top: calc(5rem + 1vh);
  
  @media (min-height: 500px) {
    top: calc(5rem + 11vh);
  }

  @media (orientation: landscape) {
    --height: 60dvh;
    top: calc(3rem + 5vh);
  }
  
  left: calc((100dvw - var(--width)) / 2);
  
  display: grid;
  width: var(--width);
  height: var(--height);
  min-height: max-content;
  padding: 1rem;
  grid-template-columns: 1fr 1.35fr;
  grid-template-rows: 0.5fr 0.5fr;
  gap: 1em;
  
  border: 2px solid white;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 24px;
  
  
  
  #instructions-close-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: min(4vw, 3.5vh);
    text-align: center;
  }
  
  
  div.inst-quad {
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-sizing: content-box;
  }
  
  
  div.inst-quad > div {
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: 50%;
    display: flex;
    gap: 1em;
  }
  
  .inst-text {
    font-size: min(3.5vw, 3vh);
    color: white;
    font-weight: bold;
    
    @media (orientation: landscape) {
      font-size: min(3vw, 4vh);
    }
    
  }
  
  
  .inst-arrow {
    .the-arrow {
      max-width: calc(0.1 * var(--width)) !important;
      max-height: calc(0.1 * var(--height)) !important;
    }
  }
  
  div.inst-quad.top-left {
    // grid-area shorthand: row-start / column-start / row-end / column-end;
    grid-area: 1 / 1 / 2 / 2;
    margin-bottom: auto;
    .the-arrow {
      // flip right to left
      transform: translateY(-5px) rotateZ(-90deg);
    }
  }
  
  
  
  div.inst-quad.top-right {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: auto;
    text-align: right;
    .inst-text {
      justify-content: flex-end;
    }
    .inst-arrow {
      align-self: end;
    }
    .the-arrow {
      transform: translateY(-5px) rotateZ(30deg);
    }
  }
  
  div.inst-quad.bottom-left {
    grid-area: 2 / 1 / 3 / 2;
    flex-direction: column-reverse;
    margin-top: auto;
    .the-arrow {
      transform: translateY(5px) rotateX(180deg);
    }
  }
  
  div.inst-quad.bottom-right {
    grid-area: 2 / 2 / 3 / 3;
    flex-direction: column-reverse;
    margin-top: auto;
    text-align: right;
    .inst-text {
      justify-content: flex-end;
    }
    .inst-arrow {
      align-self: end;
    }
    .the-arrow {
      transform: translateY(5px) rotateX(180deg) rotateZ(90deg);
    } 
    
    @media (min-height: 500px) {
      .the-arrow {
        transform: translateY(5px) rotateX(180deg) rotateZ(45deg);
      } 
    }
  }
  
  
}

#introduction-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  height: fit-content;
  // outline: 5px solid var(--accent-color);
  border-radius: 1em;

  @media (max-width: 700px) {
    width: 95%;
    padding: 1em;
  }

  @media (min-width: 701px) {
    width: 75%;
    padding: 2em;
  }

  .span-accent {
    color: var(--accent-color);
  }

  // rotated translucent background gradient
  background: linear-gradient(45deg,
                            rgb(14, 30, 40), 
                            rgb(22, 50, 65), 
                            rgb(30 70 90));

  
  font-size: calc(1.1 * var(--default-font-size));
  line-height: var(--default-line-height);

  .v-list-item__prepend {
    margin-right: 0.75em;
  }
  
  .v-list-item {
    color: #eee;
  }
  
  .intro-text {
    color: white;
  }
  
  strong {
    color: white;
  }
  
  div#intro-bottom-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;

    gap: 1em;
    margin-top:0.5em;

    .v-btn.v-btn--density-default {
        max-height: calc(1.6 * var(--default-line-height));
      }  

    .v-btn--size-default {
      font-size: calc(0.9 * var(--default-font-size));
    }    
  
    #intro-reminder {
      outline: 1px solid red;
    }
    
    #intro-next-button {
      background-color: rgba(18, 18, 18,.5);
    }
  }
}

#speed-control {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 5px;
  margin-left: 10px;
  
  @media (orientation: landscape) {
    margin-left: 3rem;
  }
  
  @media (max-width: 370px) {
    justify-content: center;
  }

  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }

}

#enclosing-playback-container.desktop-playback-control {
  --tick-font-size: 12px;
  margin-bottom: calc(2.5rem + 5px);
  padding-right: 1rem;
  
}

#enclosing-playback-container.inset.mobile-playback-control {
  padding-right: 1rem;
}

#enclosing-playback-container > #playback-play-pause-button {
  pointer-events: auto!important;
}

#inline-speed-control {
  display: flex; 
  flex-grow:1; 
  align-items: flex-end; 
  position: relative; 
  gap: 5px;
  
  // when the screen is small enough we want to hide the buttons in inline mode
  @media (min-width: 369px) {
    #enclosing-playback-container > #playback-play-pause-button {
      display: none;
    }
    
    #enclosing-playback-container > #playback-close-button {
      display: none;
    }
  }
  // when small enough we want to cover the controls
  @media (max-width: 370px) {
    // position: absolute;
    flex-grow: 0;
    #enclosing-playback-container.mobile-playback-control {
      position: fixed;
      width: calc(90% - 1rem);
      left: 50%;
      --off: calc(50% - 5px);
      transform: translateX(-50%) translateY(var(--off)) !important;
    }
  }
}

#speed-text {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 0.4em;
  padding-block: 0.15em;
  border-radius: 0.3em;
  font-size: calc(1 * var(--default-font-size));
  text-wrap: nowrap;  
  width: fit-content;

  left: calc(100% + 1rem);
  top: 1.5rem;
  
  @media (max-width: 600px) {
    position: relative;
    top: 3rem;
    left: 0.5rem;
    display: inline;
  }
}

#eclipse-percent-chip {
  // position: absolute;
  // right: 0.5rem;
  // top: calc(-1.5 * var(--default-line-height));
    display: flex;
    width: 100%;
    justify-content: space-between;

  .v-chip.v-chip--density-default {
    height: var(--default-line-height);
    padding-inline: 0.8rem;
    padding-block: 0.8rem;
  }

  .v-chip__content {
    font-size: calc(0.8 * var(--default-font-size));
}


}

#top-wwt-content {
  position: absolute;
  top: calc(var(--default-font-size) + 0.5rem);
  right: 0.5rem;

  #location-date-display  {
  
    display: flex;
    justify-content: flex-end;
    flex-wrap: column;
    gap:5px;
    
    @media (max-width: 600px) {
      flex-direction: column;
      align-items: flex-end;
    }
    
    @media (max-width: 250px) {
      padding-top: 3.5em;
    }
    
    @media (max-width: 700px) {
      .v-chip.v-chip--density-default {
        height: var(--default-line-height);
        padding-inline: calc(0.6 * var(--default-line-height));
        padding-block: calc(0.8 * var(--default-line-height));
      }

      .v-chip__content {
        font-size: calc(1.2 * var(--default-font-size));
      }
    }

  }

  .icon-wrapper {
    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    }

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    }
  }

  .v-switch__thumb {
    color: var(--accent-color);
    background-color: black;

    @media (min-width: 751px) { //LARGE
      height: 2.1rem;
      width: 2.2rem;
    }
  }

  .v-input--density-default {
    --v-input-control-height: 0;
  }

  .v-selection-control--density-default {
    --v-selection-control-size: auto;
  } 

  .v-switch__track {
    background-color: #737373 !important;
  }

  .v-switch--inset .v-switch__track {
    @media (min-width: 751px) { //LARGE
      height: 2.5rem;
      width: 4.2rem;
    }
  }

  pointer-events: auto;

  #top-switches {
    position: absolute;
    right: 0;
    text-align: right;

    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    } 

  }
 
  #track-sun-switch {
    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    } 
  }
}

#change-optout {
  
  @media (max-width: 600px) {
    position: absolute;
    bottom: -0.5rem ;
    right: 0.5rem;
  }
  
  .icon-wrapper {
    margin: 0;
    padding: 0.15em;
    border: none;
    min-width: 0;
  }
}

#privacy-popup-dialog {

  .v-card-text {
    color: #BDBDBD;
  }

  .v-overlay__content {
    font-size: var(--default-font-size);
    background-color: purple;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .v-btn--size-default {
      font-size: calc(0.9 * var(--default-font-size));
    }  

  .v-card-actions .v-btn {
    padding: 0 4px;
  }
}

a {
    text-decoration: none;
    font-weight: bold;
    color: #7996DA; // lighter variant of CosmicDS logo blue
    pointer-events: auto;
  }

#inline-open-icon {
  background-color: var(--accent-color);
  border-radius: 50%;
  border: 1.5px solid var(--accent-color);
}


#mobile-zoom-control {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .vue-slider {    
    .vue-slider-rail {
      width: 10px;
      left: calc(-10px / 2 + 2.5px);
    }
  }
  
  
  .slider-padding {
    margin-block: 1em;
    color: var(--accent-color);
  }
  
}


// this is class called blink that makes a span look like a round blinking circle period of 1 sec
.blink {
  animation: blinker 1s linear infinite;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  background-color: #29ff29;
  display: inline-block;
}

@keyframes blinker {
  10% {
    opacity: 0;
  }
}

.icon-wrapper {
  width: fit-content;
}

#forward-geocoding-container {
  position: relative;
  width: fit-content;
  color: var(--accent-color);
  background-color: black;
  border: 2px solid var(--accent-color);
  border-radius: 20px;
  padding: var(--fg-container-padding);

  .v-text-field {
    min-width: 150px;
    width: min(200px, 20vw);
  }
  
  .forward-geocoding-input.geocode-success label {
    color: var(--accent-color);
    opacity: 1;
  }

  #forward-geocoding-input-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 10px;
    align-items: center;
  }

  #geocoding-search-icon {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
  }

  #geocoding-search-icon:hover, #geocoding-close-icon:hover {
    cursor: pointer;
  }

  // For some reason setting width: 100% makes the search results 2px too small
  // It's probably some Vuetify styling thing
  // Maybe there's a better workaround, but this gets the job done for now
  #forward-geocoding-results {
    position: absolute;
    top: 42px;
    left: -1px;
    width: calc(100% + 2px);
    background: black;
    border: 1px solid var(--accent-color);
    border-top: 0px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding: 0px 10px;

    .forward-geocoding-result {
      border-top: 1px solid var(--accent-color);
      font-size: 12pt;
      pointer-events: auto;

      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
