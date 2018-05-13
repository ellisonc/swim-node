
from selenium import webdriver
import re
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import DesiredCapabilities
from bs4 import BeautifulSoup
import time
import sys

#**************************************************************************************************
# submitForm
#
# submit the initial form to usaswimming
#
#**************************************************************************************************
def submitForm(firstName, lastName, driver):
    try:
        fname_field = driver.find_element_by_name('FirstName')
        lname_field = driver.find_element_by_name('LastName')
        startDate = driver.find_element_by_name('UsasTimeSearchIndividual_Index_Div_1StartDate')
        endDate = driver.find_element_by_name('UsasTimeSearchIndividual_Index_Div_1EndDate')
        submit  = driver.find_element_by_id('UsasTimeSearchIndividual_Index_Div_1-saveButton')

        fname_field.send_keys(firstName)
        lname_field.send_keys(lastName)

        submit.click()
    except:
        print("err")


#**************************************************************************************************
# getTimes
#
# Retrieve times from usaswimming database based on name only
#
#**************************************************************************************************
def getTimes(firstName, lastName):
    header = DesiredCapabilities.PHANTOMJS.copy()
    header['phantomjs.page.customHeaders.User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' \
                                                                  'AppleWebKit/537.36 (KHTML, like Gecko) ' \
                                                                  'Chrome/39.0.2171.95 Safari/537.36'
    driver = webdriver.PhantomJS(executable_path='C:\Phantom\phantomjs.exe', desired_capabilities=header)
    #driver = webdriver.Chrome(executable_path="C:\Chrome\chromedriver.exe")
    driver.get("https://www.usaswimming.org/Home/times/individual-times-search")

    #Submit the initial form
    submitForm(firstName, lastName, driver)

    time.sleep(1)   #wait for the response
    pageSource = driver.page_source
    bsObj = BeautifulSoup(pageSource, "lxml")

    clubTable = None
    try:
        clubTable = driver.find_element_by_id("UsasTimeSearchIndividual_PersonSearchResults_Grid-1")
    except:
        None

    table = bsObj.find("tbody", {"role":"rowgroup"})
    if(clubTable is not None):
        print("true")
        count = 0
        for row in table.children:
            print(row.td.next_sibling.text)
            count += 1
    else:
        print("false")

    driver.close()
#End getTimes

#**************************************************************************************************
# getClubs.py - prints true followed by a list  of clubs, or false if the swimmer has no need
#
#**************************************************************************************************

firstname = sys.argv[1]
lastname = sys.argv[2]
getTimes(firstname, lastname)
sys.stdout.flush()
exit