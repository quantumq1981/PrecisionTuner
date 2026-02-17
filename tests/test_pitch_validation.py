import math
import time

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

TEST_FREQUENCIES = [82.4069, 110.0, 146.832, 196.0, 246.942, 329.628, 440.0, 659.255]


def freq_to_note_name(freq: float) -> str:
  midi = round(69 + 12 * math.log2(freq / 440.0))
  note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return f"{note_names[midi % 12]}{(midi // 12) - 1}"


@pytest.fixture(scope='module')
def driver():
  options = webdriver.ChromeOptions()
  options.add_argument('--headless=new')
  drv = webdriver.Chrome(options=options)
  drv.get('http://localhost:3000')
  drv.find_element(By.ID, 'btnStart').click()
  time.sleep(1)
  yield drv
  drv.quit()


def test_oscillator_frequencies(driver):
  driver.find_element(By.ID, 'oscTestToggle').click()
  select = Select(driver.find_element(By.ID, 'oscFreqSelect'))

  for freq in TEST_FREQUENCIES:
    select.select_by_value(str(freq))
    time.sleep(0.6)
    note = driver.find_element(By.ID, 'noteText').text
    cents = float(driver.find_element(By.ID, 'centsText').text.replace('¢', '').strip())

    assert note == freq_to_note_name(freq)
    assert abs(cents) <= 3.0
