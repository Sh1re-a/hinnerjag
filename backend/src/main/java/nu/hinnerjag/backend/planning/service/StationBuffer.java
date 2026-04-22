package nu.hinnerjag.backend.planning.service;

public enum StationBuffer {

    T_CENTRALEN("t-centralen", 6,
            "Stor bytespunkt med flera trafikslag, hög belastning och långa förflyttningar"),

    STOCKHOLM_CITY("stockholm city", 6,
            "Djup pendeltågsstation under city med stora passagerarflöden"),

    ODENPLAN("odenplan", 5,
            "Stor bytespunkt mellan pendeltåg och tunnelbana med djup station"),

    SLUSSEN("slussen", 5,
            "Komplex bytespunkt med nivåskillnader och längre gångvägar"),

    GULLMARSPLAN("gullmarsplan", 4,
            "Stor bytespunkt mellan buss och tunnelbana"),

    KUNGSTRADGARDEN("kungsträdgården", 5,
            "Djup station med lång vertikal förflyttning"),

    RADHUSET("rådhuset", 4,
            "Djup blålinjestation med långa rulltrappor"),

    STADSHAGEN("stadshagen", 4,
            "Djup blålinjestation med långa rulltrappor"),

    SOLNA_CENTRUM("solna centrum", 4,
            "Djup blålinjestation med längre väg till plattform"),

    TEKNISKA("tekniska högskolan", 4,
            "Långa gångvägar beroende på uppgång"),

    DEFAULT("default", 3,
            "Vanlig tunnelbanestation med normal marginal till plattform");

    private final String name;
    private final int minutes;
    private final String reason;

    StationBuffer(String name, int minutes, String reason) {
        this.name = name;
        this.minutes = minutes;
        this.reason = reason;
    }

    public int getMinutes() {
        return minutes;
    }

    public String getReason() {
        return reason;
    }

    public static StationBuffer from(String stationName) {
        if (stationName == null) return DEFAULT;

        String normalized = normalize(stationName);

        for (StationBuffer buffer : values()) {
            if (buffer.name.equals(normalized)) {
                return buffer;
            }
        }

        return DEFAULT;
    }

    private static String normalize(String value) {
        return value
                .toLowerCase()
                .replace("å", "a")
                .replace("ä", "a")
                .replace("ö", "o")
                .trim();
    }
}