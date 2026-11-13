---
name: trip-brief
description: "Plans a city trip from research: day plans grouped by area with real opening hours, prices and travel times, a PDF itinerary to keep offline, reminders for what has to be booked, and a countdown widget to the day of departure. Use when someone asks to plan a trip, an itinerary, or a few days in a city."
license: Apache-2.0
---

# Trip brief

A trip to one city, planned from research rather than memory. Four of NuJan's abilities work together here: web
research, a printable PDF, phone reminders, and a widget on the home screen.

## Do this

1. **Pin down the trip:** the city, the dates (or the month and the number of days), who is going and what they enjoy.
   Ask once for whatever is missing.
2. **Research it** with `web_search`, then read the pages with `extract_article`, or `web_fetch` when a page will not
   extract. Use official sites first: for each sight that fits their interests, the opening hours on their days, the
   ticket price in local currency, and whether it must be booked ahead; where to stay; how to get in from the
   airport; the local transport pass; the usual weather that month. Keep the address of every page you use.
3. **Plan the days:** two or three main sights a day, grouped by area so the walks are short, with a place for lunch
   and an idea for the evening. Put a sight that needs booking on a day when it is open.
4. **Make the PDF** with `create_pdf`: a title page with the city and dates; one page per day with times, addresses,
   prices and the travel time between stops; a page of bookings to make, each with its link and the latest day to
   book; the airport transfer and transport pass; the sources at the end.
5. **Set reminders** with `create_reminder`: one for each booking, a few days before its latest day to book, and one
   for checking in the day before departure.
6. **Offer the countdown**, and make it only if the person wants one: `create_widget`, size 2x1, with the city's name
   and the days left until departure (a `device` binding with field `countdown` and the departure date as its value),
   then `pin_widget`, so Android offers to place it on the home screen.
7. **Answer** with one line per day, the bookings to make first, the reminders that were set, the PDF, and the
   countdown widget when there is one.

## Check before answering

- Every opening hour and price in the PDF came from a page you read, and that page is in the sources.
- No day sends them across the city and back between two stops.
- Every reminder falls before the booking it is for.

## Never

- Invent opening hours, prices or booking rules; say what could not be confirmed.
- Book or pay for anything: list what to book and where.
