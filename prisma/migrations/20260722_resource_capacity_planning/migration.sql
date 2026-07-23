ALTER TABLE "WorkingCalendar" ADD COLUMN "holidayCalendarId" TEXT;
CREATE INDEX "WorkingCalendar_organizationId_holidayCalendarId_idx" ON "WorkingCalendar"("organizationId", "holidayCalendarId");
ALTER TABLE "WorkingCalendar" ADD CONSTRAINT "WorkingCalendar_holidayCalendarId_fkey" FOREIGN KEY ("holidayCalendarId") REFERENCES "HolidayCalendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
