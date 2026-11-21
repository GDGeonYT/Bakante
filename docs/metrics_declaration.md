# Metrics Declaration Form — Track 5 (Bakante)

- **Team Project**: Bakante (ISATU Real-Time Facility & Room Booking System)
- **Track**: Track 5 — University Operations: Facility & Room Booking
- **Test Dataset**: 20 curated ISATU facility booking requests (`baseline/dataset.csv`: 10 valid bookings including back-to-back boundary slots, 6 overlap/conflict traps, and 4 data-error traps)

## Declared Parameters (3 Rows)

| # | Parameter (Sec. 9.2) | What It Measures | Manual Baseline Method | New System (Bakante) Method |
|---|---|---|---|---|
| 1 | **Processing Time** | Total time (seconds) to check room availability, verify conflicts, and process all 20 requests | QA Analyst enters all 20 requests into `manual_log_template.csv` in Excel/Sheets while checking `facilities.json`, timed with a stopwatch | Automated replay of the same 20 requests through Bakante's SQLite + Binary Search API (`npm run benchmark`) |
| 2 | **Duplicate / Conflict Rate** | % of overlapping/double-booked requests admitted into the final schedule | Count of the 6 conflict traps accidentally logged as valid by the manual operator ÷ 20 × 100 | Count of conflict traps admitted by Bakante ÷ 20 × 100 (verified 0%) |
| 3 | **Error Rate** | % of invalid requests (missing fields, room-name typos, inverted times, over-capacity) admitted into the schedule | Count of invalid requests (out of 20) admitted without rejection ÷ 20 × 100 | Count of invalid requests admitted past Bakante's input gatekeeper ÷ 20 × 100 (verified 0%) |

## Official Improvement Formula (Section 9.1)

$$\text{\% Improvement} = \frac{|\text{Baseline} - \text{New}|}{\text{Baseline}} \times 100$$
