class SimClock:
    def __init__(self, seed: int = 42):
        self.tick = 0
        self.sim_hour = 6.0
        self.sim_day = 1
        self.sim_month = 1
        self.sim_year = 2045
        self.speed = 1.0
        self.paused = False

    def advance(self, real_seconds: float) -> None:
        if self.paused:
            return
        
        self.tick += 1
        hours_to_add = (self.speed * real_seconds) / 3600.0
        self.sim_hour += hours_to_add

        while self.sim_hour >= 24.0:
            self.sim_hour -= 24.0
            self.sim_day += 1
            if self.sim_day > 30:
                self.sim_day = 1
                self.sim_month += 1
                if self.sim_month > 12:
                    self.sim_month = 1
                    self.sim_year += 1

    def get_time_string(self) -> str:
        hours = int(self.sim_hour)
        minutes = int((self.sim_hour - hours) * 60)
        return f"Day {self.sim_day}, {hours:02d}:{minutes:02d}"

    def get_sim_time_of_day(self) -> str:
        if 5 <= self.sim_hour < 12:
            return "morning"
        elif 12 <= self.sim_hour < 17:
            return "afternoon"
        elif 17 <= self.sim_hour < 21:
            return "evening"
        else:
            return "night"
