import logger from "@/logging";
import * as fs from "node:fs";

const dataItems = {
	"indicators": [
		{
			"name": " Proportion of WCBA using modern contraceptives",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": " Proportion of WCBA using modern contraceptives",
			"description": " Proportion of WCBA using modern contraceptives",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{ZPJuAF2ogS3.Hf8wh96pGtr} + #{ZPJuAF2ogS3.URD356qUbKz} + #{uwKpxDMQAT8.Hf8wh96pGtr} + #{uwKpxDMQAT8.URD356qUbKz} + #{mn9VuAGknnl.Hf8wh96pGtr} + #{mn9VuAGknnl.URD356qUbKz} + #{SG4mknUU5xY.Hf8wh96pGtr} + #{SG4mknUU5xY.URD356qUbKz} + #{IH0IYxoUUFX.Hf8wh96pGtr} + #{IH0IYxoUUFX.URD356qUbKz} + #{NFgNAvKYjth.Hf8wh96pGtr} + #{NFgNAvKYjth.URD356qUbKz}",
			"numeratorDescription": "Contraceptive & Birth spacing service",
			"denominator": "#{oFCPlJ9wLjh}",
			"denominatorDescription": "Population of WCBA",
			"id": "rXwORArXkTS",
			"attributeValues": []
		},
		{
			"name": "ANC 4th visit plus coverage",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 4th visit plus coverage",
			"description": "ANC 4th and 5th plus, visit coverage",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{Bl9cq5ZpeU5.GDF1EcYK4f9} + #{Bl9cq5ZpeU5.Le7Ni4du5qq} + #{pK0TIVasXca.GDF1EcYK4f9} + #{pK0TIVasXca.Le7Ni4du5qq}",
			"numeratorDescription": "Antenatal care 4th visit plus",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Estimated population pregnant",
			"id": "dDW89CuoNVI",
			"attributeValues": []
		},
		{
			"name": "ANC deworming rate",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC deworming rate",
			"description": "Antenatal Care Deworming Coverage Percentage",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{BliZZWc30Ab.GDF1EcYK4f9} + #{BliZZWc30Ab.Le7Ni4du5qq}",
			"numeratorDescription": "ANC clients provided with deworming medication",
			"denominator": "#{L4EsISvd1Hu.GDF1EcYK4f9} + #{L4EsISvd1Hu.Le7Ni4du5qq}",
			"denominatorDescription": "ANC 1st visit total",
			"id": "daSO0cO4XWI",
			"attributeValues": []
		},
		{
			"name": "Antenatal Client 1st visit  before 12 weeks coverage",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1  <12 weeks coverage",
			"description": "Proportion of antenatal clients seen for 1st visit before 12 weeks of pregnancy",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{Y0bt1niBB2g.GDF1EcYK4f9} + #{Y0bt1niBB2g.Le7Ni4du5qq}",
			"numeratorDescription": "Antenatal Client 1st visit before 12 weeks",
			"denominator": "#{L4EsISvd1Hu}",
			"denominatorDescription": "Antenatal Care 1st visit",
			"id": "av9VHUMlQRZ",
			"attributeValues": []
		},
		{
			"name": "Antenatal Client 1st visit coverage",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1 coverage",
			"description": "Proportion of antenatal clients seen for 1st visit out of estimated pregnant population",
			"legendSets": [],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{L4EsISvd1Hu.GDF1EcYK4f9} + #{L4EsISvd1Hu.Le7Ni4du5qq}",
			"numeratorDescription": "Antenatal Client 1st visit ",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Population estimated pregnant",
			"id": "hMjXv7oIK0S",
			"attributeValues": []
		},
		{
			"name": "Antenatal Client Syphilis screening rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC Syphilis screening rate",
			"description": "Proportion of antenatal clients who were screened for Syphilis during ANC 1st visit",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{BzdkO9tAKpE.GDF1EcYK4f9} + #{BzdkO9tAKpE.Le7Ni4du5qq}",
			"numeratorDescription": "Antenatal Client 1st visit screened for Syphilis",
			"denominator": "#{L4EsISvd1Hu}",
			"denominatorDescription": "Antenatal Care 1st visit",
			"id": "ZOfKdGyrQRQ",
			"attributeValues": []
		},
		{
			"name": "Antenatal client  1st visit Iron Folic Acid supplementation rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC1 Iron Folic Acid supplement rate",
			"description": "Proportion of antenatal clients who received Iron Folic Acid during ANC 1st visit",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{ww7a9OBJjEx.GDF1EcYK4f9} + #{ww7a9OBJjEx.Le7Ni4du5qq}",
			"numeratorDescription": "ANC Iron Folic Acid 1st Supply",
			"denominator": "#{L4EsISvd1Hu}",
			"denominatorDescription": "Antenatal Care 1st visit",
			"id": "s4DtdjbPRme",
			"attributeValues": []
		},
		{
			"name": "Antenatal client dropout rate 1st to 4th visit",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1-4th visit dropout rate",
			"description": "Antenatal clients that have a 1st visit but not a 4th visit",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{L4EsISvd1Hu} - #{Bl9cq5ZpeU5}",
			"numeratorDescription": "Antenatal Client 1st visit minus Antenatal Care 4th visit",
			"denominator": "#{L4EsISvd1Hu}",
			"denominatorDescription": "Antenatal Care 1st visit",
			"id": "itcss3zzJs9",
			"attributeValues": []
		},
		{
			"name": "BCG coverage (0-11 m)",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "BCG coverage",
			"description": "Proportion of infants (0-11 m) who received BCG vaccine",
			"legendSets": [
				{
					"id": "qrqVrxGfCgB"
				}
			],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{WMs1OfiqmYO.jCVHwSecoKx} + #{WMs1OfiqmYO.OzEE6niK5jw}",
			"numeratorDescription": "BCG doses (0 - 11 m)",
			"denominator": "#{oWfpYOzEv99}",
			"denominatorDescription": "Population 0-11 months",
			"id": "Z3TcV2qnXvD",
			"attributeValues": []
		},
		{
			"name": "Contraceptive Coverage",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Contraceptive Coverage",
			"description": "Contraceptive Coverage, Birth Spacing Services",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{ZPJuAF2ogS3.Hf8wh96pGtr} + #{ZPJuAF2ogS3.URD356qUbKz} + #{uwKpxDMQAT8.Hf8wh96pGtr} + #{uwKpxDMQAT8.URD356qUbKz} + #{mn9VuAGknnl.Hf8wh96pGtr} + #{mn9VuAGknnl.URD356qUbKz} + #{SG4mknUU5xY.Hf8wh96pGtr} + #{SG4mknUU5xY.URD356qUbKz} + #{IH0IYxoUUFX.Hf8wh96pGtr} + #{IH0IYxoUUFX.URD356qUbKz} + #{NFgNAvKYjth.Hf8wh96pGtr} + #{NFgNAvKYjth.URD356qUbKz}",
			"numeratorDescription": "Contraceptive & Birth spacing service",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Estimated Pregnancy population",
			"id": "kPboZRe9PEN",
			"attributeValues": []
		},
		{
			"name": "Delivery by Caesarean section rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery C/Section rate",
			"description": "Proportion of deliveries in a facility that were carried out via Caesarean section",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{Xm3C6o5ntcW}",
			"numeratorDescription": "Delivery by Caesarean section ",
			"denominator": "#{PIZQsdZsmMn} + #{Xm3C6o5ntcW} + #{O7WEUv1n6RF}",
			"denominatorDescription": "Delivery in facility by type",
			"id": "hf7B8fBvS8c",
			"attributeValues": []
		},
		{
			"name": "Delivery coverage in facility",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery coverage in facility",
			"description": "Proportion of deliveries carried out in facility versus expected deliveries (expected live births)",
			"legendSets": [],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{PIZQsdZsmMn} + #{Xm3C6o5ntcW} + #{O7WEUv1n6RF}",
			"numeratorDescription": "Delivery in facility by type",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Population expected pregnant",
			"id": "lGagAgRnWQA",
			"attributeValues": []
		},
		{
			"name": "HIV Positivity Rate Among Pregnant Women",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Positivity Rate Among Pregnant Women",
			"description": "Proportion of pregnant women tested HIV positive",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{V3QJWuKWcMN.J3SqSHbYHDB} + #{V3QJWuKWcMN.nzK9vg1dQ8k} + #{V3QJWuKWcMN.Ev69awKOjyr}",
			"numeratorDescription": "ANC clients tested for HIV",
			"denominator": "#{L4EsISvd1Hu.GDF1EcYK4f9} + #{L4EsISvd1Hu.Le7Ni4du5qq}",
			"denominatorDescription": "ANC 1st visit total",
			"id": "yaajEXsSwYT",
			"attributeValues": []
		},
		{
			"name": "HIV Testing Rate Among Pregnant Women",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Testing Rate Among Pregnant Women",
			"description": "Proportion of pregnant women tested and know their HIV status.",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{twoOM8l9rzj.J3SqSHbYHDB} + #{twoOM8l9rzj.nzK9vg1dQ8k} + #{twoOM8l9rzj.Ev69awKOjyr}",
			"numeratorDescription": "ANC clients tested for HIV",
			"denominator": "#{L4EsISvd1Hu.GDF1EcYK4f9} + #{L4EsISvd1Hu.Le7Ni4du5qq}",
			"denominatorDescription": "ANC 1st visit total",
			"id": "fokSa6WTCFH",
			"attributeValues": []
		},
		{
			"name": "HIV test positivity rate",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV test positivity rate",
			"description": "Proportion of HIV tests positive versus total number of tests performed",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{waIzDrZ83kX.ipWSodt64QV} + #{waIzDrZ83kX.RpejjJlgEvw} + #{waIzDrZ83kX.YWpCfErY2Nt} + #{waIzDrZ83kX.C2EaE6ESJTn} + #{waIzDrZ83kX.tGhk5UYquuF} + #{waIzDrZ83kX.G04YWY9gEgU} + #{waIzDrZ83kX.tolLSvO5tSI} + #{waIzDrZ83kX.pzNC2lFLPyg}",
			"numeratorDescription": "HIV tests positive ",
			"denominator": "#{a5biGY0G6EK.ipWSodt64QV} + #{a5biGY0G6EK.RpejjJlgEvw} + #{a5biGY0G6EK.YWpCfErY2Nt} + #{a5biGY0G6EK.C2EaE6ESJTn} + #{a5biGY0G6EK.tGhk5UYquuF} + #{a5biGY0G6EK.G04YWY9gEgU} + #{a5biGY0G6EK.tolLSvO5tSI} + #{a5biGY0G6EK.pzNC2lFLPyg}",
			"denominatorDescription": "HIV tests performed, total",
			"id": "x80cvvJjP1R",
			"attributeValues": []
		},
		{
			"name": "Instrumental_Ventouse Delivery coverage in facility",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Instrumental Delivery coverage in facility",
			"description": "Percentage of Instrumental type deliveries carried out in facility versus expected deliveries (expected live births)",
			"legendSets": [],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{PIZQsdZsmMn}",
			"numeratorDescription": "Instrumental Delivery",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Population expected pregnant",
			"id": "Kx63ZxJk5u2",
			"attributeValues": []
		},
		{
			"name": "Measles 1st dose coverage (0 - 11 m)",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Measles - 1 coverage",
			"description": "Proportion of infants (0 - 11 m) who received Measles vaccine 1st dose. Measles 1st dose over 12 months is NOT included",
			"legendSets": [
				{
					"id": "qrqVrxGfCgB"
				}
			],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{hzD1f9bAoCQ.jCVHwSecoKx} + #{hzD1f9bAoCQ.OzEE6niK5jw}",
			"numeratorDescription": "Measles 1st dose (0 - 11 m)",
			"denominator": "#{oWfpYOzEv99}",
			"denominatorDescription": "Population 0-11 months",
			"id": "QKne86gayiA",
			"attributeValues": []
		},
		{
			"name": "Normal Delivery coverage in facility",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Normal Delivery coverage in facility",
			"description": "Percentage of Normal deliveries type carried out in facility versus expected deliveries (expected live births)",
			"legendSets": [],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{O7WEUv1n6RF}",
			"numeratorDescription": "Normal Delivery",
			"denominator": "#{Ma8TjkWwvVs}",
			"denominatorDescription": "Population expected pregnant",
			"id": "H7kjqzC3mAX",
			"attributeValues": []
		},
		{
			"name": "Stillbirth rate per 1,000 births in facility",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Stillbirth rate in facility",
			"description": "Proportion of infants that were stillborn per 1,000  births",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "TEFu1L5ToI7"
			},
			"numerator": "#{umt6ky0nJPZ}+#{JDFy9CeJsxK}",
			"numeratorDescription": "Stillbirth in facility",
			"denominator": "#{EbzB7NBlL7B}+#{umt6ky0nJPZ} + #{JDFy9CeJsxK}",
			"denominatorDescription": "Live Birth in facility + Stillbirth",
			"id": "V2nXvk3k2Zl",
			"attributeValues": []
		},
		{
			"name": "Total HIV clients Tested and given results ",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV clients Tested and given results ",
			"description": "Total HIV clients counselled, tested and given results ",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{a5biGY0G6EK.ipWSodt64QV} + #{a5biGY0G6EK.RpejjJlgEvw} + #{a5biGY0G6EK.YWpCfErY2Nt} + #{a5biGY0G6EK.C2EaE6ESJTn} + #{a5biGY0G6EK.tGhk5UYquuF} + #{a5biGY0G6EK.G04YWY9gEgU} + #{a5biGY0G6EK.tolLSvO5tSI} + #{a5biGY0G6EK.pzNC2lFLPyg}",
			"numeratorDescription": "Tested and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "y650cG0vfUs",
			"attributeValues": []
		},
		{
			"name": "Total HIV clients Tested positive and given results",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV clients tested positive",
			"description": "Total HIV clients tested positive and given results",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{waIzDrZ83kX.ipWSodt64QV} + #{waIzDrZ83kX.RpejjJlgEvw} + #{waIzDrZ83kX.YWpCfErY2Nt} + #{waIzDrZ83kX.C2EaE6ESJTn} + #{waIzDrZ83kX.tGhk5UYquuF} + #{waIzDrZ83kX.G04YWY9gEgU} + #{waIzDrZ83kX.tolLSvO5tSI} + #{waIzDrZ83kX.pzNC2lFLPyg}",
			"numeratorDescription": "HIV Tested positive and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "sKupnjspUOJ",
			"attributeValues": []
		},
		{
			"name": "Total clients newly initiated on ART",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total clients newly initiated on ART",
			"description": "Total clients newly initiated on ART",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{VnuYdXMF8cI.uPvrr5WyyoA} + #{VnuYdXMF8cI.J3SqSHbYHDB} + #{VnuYdXMF8cI.nzK9vg1dQ8k} + #{VnuYdXMF8cI.Ev69awKOjyr} + #{QtQNx2fcjE6.FgjXjbYxfeN} + #{QtQNx2fcjE6.j5bRGdxe4qn} + #{QtQNx2fcjE6.Kt59RMloTkS} + #{QtQNx2fcjE6.zii9VgQC1Qo} + #{QtQNx2fcjE6.mzL03NFV0YM} + #{QtQNx2fcjE6.plNfWYH4KSa} + #{QtQNx2fcjE6.mGMne9CHiln} + #{QtQNx2fcjE6.sarR07wwH7y}",
			"numeratorDescription": "People living with HIV  currently receiving ART ",
			"denominator": "1",
			"denominatorDescription": "Constant",
			"id": "IMK6DP7g8QW",
			"attributeValues": []
		},
		{
			"name": "Total clients on ART (1st & 2nd line regimen)",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total clients on ART",
			"description": "Total clients on ART (1st & 2nd line regimen)",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{TclS1KLSij0.AumPi8MnkaM} + #{TclS1KLSij0.FNYpKEzxldn} + #{vOyQ17i84YS.AumPi8MnkaM} + #{vOyQ17i84YS.FNYpKEzxldn} + #{PjLNEvHSxlO.AumPi8MnkaM} + #{PjLNEvHSxlO.FNYpKEzxldn} + #{gx4WkqyMugd.AumPi8MnkaM} + #{gx4WkqyMugd.FNYpKEzxldn} + #{aBpTODk37rI.FNYpKEzxldn} + #{Ng8zaOLv5TL.AumPi8MnkaM} + #{Ng8zaOLv5TL.FNYpKEzxldn} + #{QwdHMhvj7HO.AumPi8MnkaM} + #{QwdHMhvj7HO.FNYpKEzxldn} + #{aQr5XI11Bkg.AumPi8MnkaM} + #{aQr5XI11Bkg.FNYpKEzxldn} + #{OkLCyHj89EX.AumPi8MnkaM} + #{OkLCyHj89EX.FNYpKEzxldn} + #{PMsKvxqFXkj.AumPi8MnkaM} + #{PMsKvxqFXkj.FNYpKEzxldn} + #{I6TAA1XOD20.AumPi8MnkaM} + #{I6TAA1XOD20.FNYpKEzxldn} + #{KrppwrfSqEd.AumPi8MnkaM} + #{KrppwrfSqEd.FNYpKEzxldn} + #{eoehrO6qziX.AumPi8MnkaM} + #{eoehrO6qziX.FNYpKEzxldn} + #{pxpPWqqe6QU.AumPi8MnkaM} + #{V6VevHG0zZX.AumPi8MnkaM} + #{V6VevHG0zZX.FNYpKEzxldn} + #{YV8hAGIAU4V.AumPi8MnkaM} + #{YV8hAGIAU4V.FNYpKEzxldn} + #{JlBoayX8cd0.AumPi8MnkaM} + #{JlBoayX8cd0.FNYpKEzxldn} + #{zHX6cB9Rwfc.AumPi8MnkaM} + #{zHX6cB9Rwfc.FNYpKEzxldn} + #{LeHtn8uGUSs.AumPi8MnkaM} + #{LeHtn8uGUSs.FNYpKEzxldn} + #{nci3mv40F3C.AumPi8MnkaM} + #{nci3mv40F3C.FNYpKEzxldn} + #{aHzFsotyj2Q.AumPi8MnkaM} + #{aHzFsotyj2Q.FNYpKEzxldn} + #{t3e5N2AQAKB.AumPi8MnkaM} + #{t3e5N2AQAKB.FNYpKEzxldn} + #{KJArtkDBnzP.AumPi8MnkaM} + #{kAmnuZrVWdn.AumPi8MnkaM} + #{kAmnuZrVWdn.FNYpKEzxldn} + #{GpyCjhlS0iF.AumPi8MnkaM} + #{GpyCjhlS0iF.FNYpKEzxldn} + #{Ss43YjOF69E.AumPi8MnkaM} + #{Ss43YjOF69E.FNYpKEzxldn} + #{wkFOl4LFowJ.AumPi8MnkaM} + #{wkFOl4LFowJ.FNYpKEzxldn} + #{RfPIbC64SJI.AumPi8MnkaM} + #{RfPIbC64SJI.FNYpKEzxldn} + #{ggbR5TMNZBp.AumPi8MnkaM} + #{ggbR5TMNZBp.FNYpKEzxldn} + #{nuM54fiwEOv.AumPi8MnkaM} + #{nuM54fiwEOv.FNYpKEzxldn} + #{eptbKlOnAgq.AumPi8MnkaM} + #{tSkROvx5b1L.AumPi8MnkaM} + #{KUTZXckpgRs.AumPi8MnkaM} + #{KUTZXckpgRs.FNYpKEzxldn} + #{Hu4oGLuvK5u.AumPi8MnkaM} + #{Hu4oGLuvK5u.FNYpKEzxldn} + #{LBqeE9Xw6Ka.AumPi8MnkaM} + #{LBqeE9Xw6Ka.FNYpKEzxldn} + #{Xy7cNwWwrFx.AumPi8MnkaM}",
			"numeratorDescription": "Total clients on 1st and 2nd line regimen",
			"denominator": "1",
			"denominatorDescription": "Constant",
			"id": "mwvbocSjymE",
			"attributeValues": []
		},
		{
			"name": "Total clients received care HIV Pre-ART / ART",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total client received care HIV Pre-ART / ART",
			"description": "Total clients received care HIV Pre-ART / ART",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{VnuYdXMF8cI.uPvrr5WyyoA} + #{VnuYdXMF8cI.J3SqSHbYHDB} + #{VnuYdXMF8cI.nzK9vg1dQ8k} + #{VnuYdXMF8cI.Ev69awKOjyr} + #{QtQNx2fcjE6.FgjXjbYxfeN} + #{QtQNx2fcjE6.j5bRGdxe4qn} + #{QtQNx2fcjE6.Kt59RMloTkS} + #{QtQNx2fcjE6.zii9VgQC1Qo} + #{QtQNx2fcjE6.mzL03NFV0YM} + #{QtQNx2fcjE6.plNfWYH4KSa} + #{QtQNx2fcjE6.mGMne9CHiln} + #{QtQNx2fcjE6.sarR07wwH7y} + #{ulANYHeHWfr.uPvrr5WyyoA} + #{ulANYHeHWfr.J3SqSHbYHDB} + #{ulANYHeHWfr.nzK9vg1dQ8k} + #{ulANYHeHWfr.Ev69awKOjyr} + #{BIw6zakyjy8.mzL03NFV0YM} + #{BIw6zakyjy8.plNfWYH4KSa} + #{BIw6zakyjy8.mGMne9CHiln} + #{BIw6zakyjy8.sarR07wwH7y} + #{BIw6zakyjy8.FgjXjbYxfeN} + #{BIw6zakyjy8.j5bRGdxe4qn} + #{BIw6zakyjy8.Kt59RMloTkS} + #{BIw6zakyjy8.zii9VgQC1Qo} + #{SbnfVHd0rIM.uPvrr5WyyoA} + #{SbnfVHd0rIM.J3SqSHbYHDB} + #{SbnfVHd0rIM.nzK9vg1dQ8k} + #{SbnfVHd0rIM.Ev69awKOjyr} + #{rA20gX7PMvx.uPvrr5WyyoA} + #{rA20gX7PMvx.J3SqSHbYHDB} + #{rA20gX7PMvx.nzK9vg1dQ8k} + #{rA20gX7PMvx.Ev69awKOjyr} + #{Wq7UXiV0MMU.mzL03NFV0YM} + #{Wq7UXiV0MMU.plNfWYH4KSa} + #{Wq7UXiV0MMU.mGMne9CHiln} + #{Wq7UXiV0MMU.sarR07wwH7y} + #{xJbK61DDfKJ.mzL03NFV0YM} + #{xJbK61DDfKJ.plNfWYH4KSa} + #{xJbK61DDfKJ.mGMne9CHiln} + #{xJbK61DDfKJ.sarR07wwH7y} + #{Wq7UXiV0MMU.FgjXjbYxfeN} + #{Wq7UXiV0MMU.j5bRGdxe4qn} + #{Wq7UXiV0MMU.Kt59RMloTkS} + #{Wq7UXiV0MMU.zii9VgQC1Qo} + #{xJbK61DDfKJ.FgjXjbYxfeN} + #{xJbK61DDfKJ.j5bRGdxe4qn} + #{xJbK61DDfKJ.Kt59RMloTkS} + #{xJbK61DDfKJ.zii9VgQC1Qo}",
			"numeratorDescription": "Clients received care (ART and Pre -ART)",
			"denominator": "1",
			"denominatorDescription": "Constant",
			"id": "KFD3LGTbgUI",
			"attributeValues": []
		},
		{
			"name": "Dropout rate BCG to Measles 1st dose ",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "DOR BCG to Measles-1",
			"description": "Proportion of infants who received BCG but not Measles 1st dose",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "(#{WMs1OfiqmYO.jCVHwSecoKx} + #{WMs1OfiqmYO.OzEE6niK5jw}) - (#{hzD1f9bAoCQ.jCVHwSecoKx} + #{hzD1f9bAoCQ.OzEE6niK5jw})",
			"numeratorDescription": "BCG doses (0-11 m) minus Measles 1st dose (0-11 m)",
			"denominator": "#{WMs1OfiqmYO.jCVHwSecoKx}+#{WMs1OfiqmYO.OzEE6niK5jw}",
			"denominatorDescription": "BCG doses (0 - 11 m)",
			"id": "REviR8vELSy",
			"attributeValues": []
		},
		{
			"code": "MR_1_2_DROPOUT",
			"name": "Dropout rate MR1 dose to MR2 dose",
			"translations": [],
			"sharing": {
				"owner": "vUeLeQMSwhN",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "r-------"
			},
			"shortName": "MR 1-2 drop out rate (%)",
			"description": "All ages",
			"legendSets": [
				{
					"id": "kUG1usm9ZBd"
				}
			],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{hzD1f9bAoCQ} - #{yE5NyMHazNx}",
			"numeratorDescription": "MR 1 doses given - MR 2 doses given",
			"denominator": "#{hzD1f9bAoCQ}",
			"denominatorDescription": "MR 1 doses given",
			"id": "dk3T30FE3OH",
			"attributeValues": []
		},
		{
			"name": "Dropout rate Measles 1st to Measles 2nd dose",
			"translations": [],
			"sharing": {
				"owner": "HRuEIpRu6a4",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "DOR Measles",
			"description": "Proportion of infants who received Measles 1st dose but not Measles 2nd dose",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "(#{hzD1f9bAoCQ.jCVHwSecoKx} + #{hzD1f9bAoCQ.OzEE6niK5jw}) -\n(#{yE5NyMHazNx.h6dXCoZi1hB} + #{yE5NyMHazNx.ZKQMnLBHog7})",
			"numeratorDescription": "Measles 1st doses (0 - 11 m) minus Measles 2nd doses (12 - 59 m)",
			"denominator": "#{hzD1f9bAoCQ.jCVHwSecoKx} + #{hzD1f9bAoCQ.OzEE6niK5jw}",
			"denominatorDescription": "Measles 1st doses (0 - 11 m)",
			"id": "e0K3MWlQrAH",
			"attributeValues": []
		},
		{
			"name": "Dropout rate Pentavalent 1st dose to Pentavalent 3rd dose",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "DOR Penta-1 to Penta-3",
			"description": "Proportion of infants who received Pentavalent 1st dose but not Pentavalent 3rd dose",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "(#{zhxRZPwaIfT.jCVHwSecoKx} + #{zhxRZPwaIfT.OzEE6niK5jw}) - (#{uVIZtOjcqtR.jCVHwSecoKx} + #{uVIZtOjcqtR.OzEE6niK5jw})",
			"numeratorDescription": "Pentavalent 1st doses (0 - 11 m) minus Pentavalent 3rd doses (0 - 11 m)",
			"denominator": "#{zhxRZPwaIfT.jCVHwSecoKx} + #{zhxRZPwaIfT.OzEE6niK5jw}",
			"denominatorDescription": "Penta 1st doses (0 - 11 m)",
			"id": "Y3QaqaGwroQ",
			"attributeValues": []
		},
		{
			"name": "Malaria positivity rate among Antenatal clients (MF-02)",
			"translations": [],
			"sharing": {
				"owner": "aTh6SFjmd2F",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC Malaria prevalence",
			"description": "Proportion of ANC clients tested and found to be malaria positive using RDTs or Microspy",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{BFgB4NC3Tdt.NG3wy2LwbFV} + #{FcUoFRzeKTQ.NG3wy2LwbFV}",
			"numeratorDescription": "Number of positive malaria test among Antenatal clients (MF-02)",
			"denominator": "#{FcUoFRzeKTQ.qoMUIzbccBA} + #{FcUoFRzeKTQ.NG3wy2LwbFV} + #{BFgB4NC3Tdt.qoMUIzbccBA} + #{BFgB4NC3Tdt.NG3wy2LwbFV}",
			"denominatorDescription": "Number of all malaria test among Antenatal clients",
			"id": "LlQ6hk19VAl",
			"attributeValues": []
		},
		{
			"name": "OPV 0 dose coverage (0-11 m)",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "OPV 0 coverage",
			"description": "Proportion of infants (0 - 11 m) who received OPV vaccine 0 dose",
			"legendSets": [
				{
					"id": "qrqVrxGfCgB"
				}
			],
			"annualized": true,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{eR4Ojj6nRYS.jCVHwSecoKx} + #{eR4Ojj6nRYS.OzEE6niK5jw}",
			"numeratorDescription": "OPV 0 doses (0-11 m)",
			"denominator": "#{oWfpYOzEv99}",
			"denominatorDescription": "Population 0-11 months",
			"id": "ozLKfVCjKxG",
			"attributeValues": []
		},
		{
			"name": "Postnatal care for newborns within 48 hours rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Postnatal care newborn within 48 hours rate",
			"description": "Proportion of neonates who received  a checkup within 48 hours of birth",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{OMtkRAJmDN8.GDF1EcYK4f9}+#{OMtkRAJmDN8.Le7Ni4du5qq}",
			"numeratorDescription": "Postnatal 1st visit neonate (0-48 hrs)",
			"denominator": "#{EbzB7NBlL7B}",
			"denominatorDescription": "Live Birth in facility",
			"id": "r9UtfHV8pIL",
			"attributeValues": []
		},
		{
			"name": "Postnatal care for women within 48 hours rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Postnatal care woman within 48 hours rate",
			"description": "Proportion of postnatal mothers who received a checkup within 48 hours of delivery",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{DgJergzdmfd.GDF1EcYK4f9}+#{DgJergzdmfd.Le7Ni4du5qq}",
			"numeratorDescription": "Postnatal 1st Visit new mother (0-48 hrs)",
			"denominator": "#{PIZQsdZsmMn} + #{Xm3C6o5ntcW} + #{O7WEUv1n6RF}",
			"denominatorDescription": "Delivery in facility by type",
			"id": "UvKTWQYiqas",
			"attributeValues": []
		},
		{
			"name": "Proportion of ANC clients given LLINs",
			"translations": [],
			"sharing": {
				"owner": "aTh6SFjmd2F",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Proportion of ANC clients given LLINs",
			"description": "Proportion of ANC clients given LLINs",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{kKSbIF30VXo.GDF1EcYK4f9} + #{kKSbIF30VXo.Le7Ni4du5qq}",
			"numeratorDescription": "ANC Clients given LLIN ",
			"denominator": "#{L4EsISvd1Hu.GDF1EcYK4f9} + #{L4EsISvd1Hu.Le7Ni4du5qq}",
			"denominatorDescription": "Total ANC 1st visit clients",
			"id": "Qsv2llOCQUj",
			"attributeValues": []
		},
		{
			"name": "Proportion of Malaria confirmed treated with ACT",
			"translations": [],
			"sharing": {
				"owner": "aTh6SFjmd2F",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Proportion of Malaria confirmed treated with ACT",
			"description": "Proportion of Malaria confirmed treated with ACT",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{X5VcweyOXty.DUhfTKBD4Im} + #{X5VcweyOXty.XfzUrXcXTpt} + #{X5VcweyOXty.uO1uHrg8p5I}",
			"numeratorDescription": "Malaria confirmed treated with ACT",
			"denominator": "#{IkG4ksC9khS.NyINOokQCE0} + #{zPPwJ27VBb9.NyINOokQCE0} + #{IkG4ksC9khS.qZ1ElQZzoCU} + #{zPPwJ27VBb9.ilGnbFOctkN} + #{zPPwJ27VBb9.qZ1ElQZzoCU} + #{IkG4ksC9khS.ilGnbFOctkN}",
			"denominatorDescription": "Total clients tested malaria positive",
			"id": "by8IYJgpxIb",
			"attributeValues": []
		},
		{
			"name": "Skilled birth attendant delivery rate",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "SBA delivery rate",
			"description": "Proportion of deliveries carried out by skilled birth attendants in facility",
			"legendSets": [],
			"annualized": false,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{muZ9mQLjnNw}",
			"numeratorDescription": "Delivery by skilled birth attendant at health facility",
			"denominator": "#{muZ9mQLjnNw}+#{fgk97Prvsn2}",
			"denominatorDescription": "Delivery in facility",
			"id": "ncvnZ3vcNUq",
			"attributeValues": []
		},
		{
			"name": "TB case rate per 100,000 population",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB case rate",
			"description": "Proportion of registered TB cases",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "L1CP2czTFpp"
			},
			"numerator": "#{QojtRgeugv5.IWkxnpKx3OL} + #{LZd3tP0n7VW.IWkxnpKx3OL} + #{JoOZV47stNr.IWkxnpKx3OL} + #{h40UrmXDIvK.IWkxnpKx3OL} + #{F6r51xXuKBk.IWkxnpKx3OL} + #{chgDtavhYKc.IWkxnpKx3OL}",
			"numeratorDescription": "TB cases registered total",
			"denominator": "#{QHszJHrLFgx}",
			"denominatorDescription": "Population estimate",
			"id": "bvT8e3Q7M5V",
			"attributeValues": []
		},
		{
			"name": "TB case ratio male : female",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB case ratio male : female",
			"description": "Ratio of male to female TB cases",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{kNHsjHicMAn.MWyy6vzB4ks} + #{kNHsjHicMAn.DsIQrHEweSL} + #{kNHsjHicMAn.qNWaFS6RGkF} + #{kNHsjHicMAn.oPVXM0hXhQy} + #{kNHsjHicMAn.tjDDPfbMGKL} + #{kNHsjHicMAn.prgXTzKVB1s} + #{kNHsjHicMAn.gvhe7Xra2KR} + #{kNHsjHicMAn.LLDK4wn6tmX} + #{kNHsjHicMAn.XsMBH3081qX} + #{kNHsjHicMAn.PwQlEnutGWF} + #{kNHsjHicMAn.uEIXSLTSuRR} + #{kNHsjHicMAn.c3C8N5W5xUj} + #{kNHsjHicMAn.EUF43YH87pn} + #{kNHsjHicMAn.nFlmlgSj6Fq} + #{kNHsjHicMAn.NJazVLr1iOJ} + #{kNHsjHicMAn.x1TXXV5xqfE}",
			"numeratorDescription": "TB cases new and relapsed male / female",
			"denominator": "#{kNHsjHicMAn}",
			"denominatorDescription": "TB cases new and relapsed total",
			"id": "JbvZrcIP4jr",
			"attributeValues": []
		},
		{
			"name": "TB drug resistant case rate per 100,000 population",
			"translations": [],
			"sharing": {
				"owner": "HRuEIpRu6a4",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB drug resistant case rate",
			"description": "Proportion of TB cases drug resistant to Rifampicim (RR-TB) and/or multi-drug resistant (MDR-TB) per 100,000 population",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "L1CP2czTFpp"
			},
			"numerator": "#{w671v6XvLRN}",
			"numeratorDescription": "TB MDR/RR cases bacteriologically confirmed",
			"denominator": "#{QHszJHrLFgx}",
			"denominatorDescription": "Population estimate",
			"id": "o9uAdyVK78e",
			"attributeValues": []
		},
		{
			"name": "TB treatment success rate",
			"translations": [],
			"sharing": {
				"owner": "HRuEIpRu6a4",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB treatment success rate",
			"description": "Percentage all TB cases (bacteriologically confirmed + clinically diagnosed) successfully treated (cured + treatment completed) among all TB cases registered for treatment",
			"legendSets": [],
			"annualized": false,
			"decimals": 1,
			"indicatorType": {
				"id": "N7poV0IbOyX"
			},
			"numerator": "#{tGCFfM5IdT9.U9pZgGj0z27} + #{tGCFfM5IdT9.KVBtm8C9eKu} + #{tGCFfM5IdT9.RLjMwK2TOqL} + #{tGCFfM5IdT9.kLgYMFw4g1s}",
			"numeratorDescription": "TB cases cured plus TB cases who completed treatment",
			"denominator": "#{prBc2HALp3D} + #{kWGR7GUE9Lu}",
			"denominatorDescription": "TB cases treatment started (bacteriologically confirmed + clinically)",
			"id": "aBigivfc0Ut",
			"attributeValues": []
		},
		{
			"name": "Total Adults clients on ART 15+",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total Adults clients on ART 15+",
			"description": "Total Adults clients on ART 15+ (1st & 2nd line regimen)",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{TclS1KLSij0.AumPi8MnkaM} + #{TclS1KLSij0.FNYpKEzxldn} + #{vOyQ17i84YS.AumPi8MnkaM} + #{vOyQ17i84YS.FNYpKEzxldn} + #{PjLNEvHSxlO.AumPi8MnkaM} + #{PjLNEvHSxlO.FNYpKEzxldn} + #{gx4WkqyMugd.AumPi8MnkaM} + #{gx4WkqyMugd.FNYpKEzxldn} + #{aBpTODk37rI.FNYpKEzxldn} + #{Ng8zaOLv5TL.AumPi8MnkaM} + #{Ng8zaOLv5TL.FNYpKEzxldn} + #{QwdHMhvj7HO.AumPi8MnkaM} + #{QwdHMhvj7HO.FNYpKEzxldn} + #{aQr5XI11Bkg.AumPi8MnkaM} + #{aQr5XI11Bkg.FNYpKEzxldn} + #{OkLCyHj89EX.AumPi8MnkaM} + #{OkLCyHj89EX.FNYpKEzxldn} + #{PMsKvxqFXkj.AumPi8MnkaM} + #{PMsKvxqFXkj.FNYpKEzxldn} +  #{aBpTODk37rI.AumPi8MnkaM} + #{aHzFsotyj2Q.AumPi8MnkaM} + #{aHzFsotyj2Q.FNYpKEzxldn} + #{t3e5N2AQAKB.AumPi8MnkaM} + #{t3e5N2AQAKB.FNYpKEzxldn} + #{KJArtkDBnzP.AumPi8MnkaM} + #{kAmnuZrVWdn.AumPi8MnkaM} + #{kAmnuZrVWdn.FNYpKEzxldn} + #{GpyCjhlS0iF.AumPi8MnkaM} + #{GpyCjhlS0iF.FNYpKEzxldn} + #{Ss43YjOF69E.AumPi8MnkaM} + #{Ss43YjOF69E.FNYpKEzxldn} + #{wkFOl4LFowJ.AumPi8MnkaM} + #{wkFOl4LFowJ.FNYpKEzxldn} + #{KJArtkDBnzP.AumPi8MnkaM} + #{nci3mv40F3C.AumPi8MnkaM} + #{nci3mv40F3C.FNYpKEzxldn}",
			"numeratorDescription": "Total adult clients on ART 15+",
			"denominator": "1",
			"denominatorDescription": "Constant",
			"id": "XKNQ6lDIHcN",
			"attributeValues": []
		},
		{
			"name": "Total Children clients on ART (0-14 yrs)",
			"translations": [],
			"sharing": {
				"owner": "OB4ujSrCI4M",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total Children clients on ART (0-14 yrs)",
			"description": "Total Children clients on ART (0-14 yrs)",
			"legendSets": [],
			"annualized": true,
			"decimals": 1,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{I6TAA1XOD20.AumPi8MnkaM} + #{I6TAA1XOD20.FNYpKEzxldn} + #{KrppwrfSqEd.AumPi8MnkaM} + #{KrppwrfSqEd.FNYpKEzxldn} + #{eoehrO6qziX.AumPi8MnkaM} + #{eoehrO6qziX.FNYpKEzxldn} + #{pxpPWqqe6QU.AumPi8MnkaM} + #{V6VevHG0zZX.AumPi8MnkaM} + #{V6VevHG0zZX.FNYpKEzxldn} + #{YV8hAGIAU4V.AumPi8MnkaM} + #{YV8hAGIAU4V.FNYpKEzxldn} + #{JlBoayX8cd0.AumPi8MnkaM} + #{JlBoayX8cd0.FNYpKEzxldn} + #{zHX6cB9Rwfc.AumPi8MnkaM} + #{zHX6cB9Rwfc.FNYpKEzxldn} + #{LeHtn8uGUSs.AumPi8MnkaM} +  #{RfPIbC64SJI.AumPi8MnkaM} + #{RfPIbC64SJI.FNYpKEzxldn} + #{ggbR5TMNZBp.AumPi8MnkaM} + #{ggbR5TMNZBp.FNYpKEzxldn} + #{nuM54fiwEOv.AumPi8MnkaM} + #{nuM54fiwEOv.FNYpKEzxldn} + #{eptbKlOnAgq.AumPi8MnkaM} + #{tSkROvx5b1L.AumPi8MnkaM} + #{KUTZXckpgRs.AumPi8MnkaM} + #{KUTZXckpgRs.FNYpKEzxldn} + #{Hu4oGLuvK5u.AumPi8MnkaM} + #{Hu4oGLuvK5u.FNYpKEzxldn} + #{LBqeE9Xw6Ka.AumPi8MnkaM} + #{LBqeE9Xw6Ka.FNYpKEzxldn} + #{Xy7cNwWwrFx.AumPi8MnkaM} + #{LeHtn8uGUSs.FNYpKEzxldn} + #{Xy7cNwWwrFx.FNYpKEzxldn} + #{eptbKlOnAgq.AumPi8MnkaM} + #{tSkROvx5b1L.FNYpKEzxldn} + #{pxpPWqqe6QU.AumPi8MnkaM}",
			"numeratorDescription": "Total children clients on 1st and 2nd line regimen",
			"denominator": "1",
			"denominatorDescription": "Constant",
			"id": "bC7YPYBf307",
			"attributeValues": []
		},
		{
			"name": "Total HIV female clients Tested and given results",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV female clients Tested and given results",
			"description": "Total HIV female clients counselled, tested and given results",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{a5biGY0G6EK.tGhk5UYquuF} + #{a5biGY0G6EK.G04YWY9gEgU} + #{a5biGY0G6EK.tolLSvO5tSI} + #{a5biGY0G6EK.pzNC2lFLPyg}",
			"numeratorDescription": "HIV female clients tested and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "UqoPYDXjm1n",
			"attributeValues": []
		},
		{
			"name": "Total HIV female clients Tested positive and given results",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV female clients Tested positive",
			"description": "Total HIV female clients tested positive and given results",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{waIzDrZ83kX.tGhk5UYquuF} + #{waIzDrZ83kX.G04YWY9gEgU} + #{waIzDrZ83kX.tolLSvO5tSI} + #{waIzDrZ83kX.pzNC2lFLPyg}",
			"numeratorDescription": "HIV female clients tested positive and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "UqGpDW4zMNn",
			"attributeValues": []
		},
		{
			"name": "Total HIV male clients Tested and given results ",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV male clients Tested and given results ",
			"description": "Total HIV male clients counselled, tested and given results ",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{a5biGY0G6EK.ipWSodt64QV} + #{a5biGY0G6EK.RpejjJlgEvw} + #{a5biGY0G6EK.YWpCfErY2Nt} + #{a5biGY0G6EK.C2EaE6ESJTn}",
			"numeratorDescription": "HIV Male clients tested and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "QUoygb5SWD9",
			"attributeValues": []
		},
		{
			"name": "Total HIV male clients Tested positive and given results",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Total HIV male clients tested positive",
			"description": "Total HIV male clients tested positive and given results",
			"legendSets": [],
			"annualized": false,
			"decimals": 0,
			"indicatorType": {
				"id": "SEXXwCdb7nL"
			},
			"numerator": "#{waIzDrZ83kX.ipWSodt64QV} + #{waIzDrZ83kX.RpejjJlgEvw} + #{waIzDrZ83kX.YWpCfErY2Nt} + #{waIzDrZ83kX.C2EaE6ESJTn}",
			"numeratorDescription": "HIV male client tested positive and given results",
			"denominator": "1",
			"denominatorDescription": "Constant 1",
			"id": "FQWbSGdxZVp",
			"attributeValues": []
		}
	],
	"dataElements": [
		{
			"name": "% of Children received Penta_3 vaccine",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "% of Children received Penta_3 vaccine",
			"formName": "% of Children who had received Penta_3 vaccine",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "I5TayL4iu6e",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "% of Women received at least 4th ANC Visits",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "% of Women received at least 4th ANC Visits",
			"formName": "% of Women received at least 4th ANC Visits",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "w0EcPIZNE7A",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Condoms female",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Condoms female",
			"description": "Condoms female",
			"formName": "Condoms female",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "SG4mknUU5xY",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Condoms male",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Condoms male",
			"description": "Condoms male",
			"formName": "Condoms male",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "IH0IYxoUUFX",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Fertility Rate",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Fertility Rate",
			"formName": "Fertility Rate",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "NUMBER",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "HxuiayGrI1N",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "HIV Prevalence",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Prevalence",
			"formName": "HIV Prevalence",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "NUMBER",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "WAIxVI7dysm",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "IUDs",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "IUDs",
			"description": "IUDs",
			"formName": "IUDs",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "mn9VuAGknnl",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Implanon",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Implanon",
			"description": "Implanon",
			"formName": "Implanon",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "NFgNAvKYjth",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Injectables (Depo)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Injectables (Depo)",
			"description": "Injectables (Depo)",
			"formName": "Injectables (Depo)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "uwKpxDMQAT8",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Oral Contraceptives",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Oral Contraceptives",
			"description": "Oral Contraceptives",
			"formName": "Oral Contraceptives",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "ZPJuAF2ogS3",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Os3mPFZG9TJ"
			}
		},
		{
			"name": "Population 0-11 months",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 0-11 months",
			"description": "Population of surviving infants",
			"formName": "Pop 0-11 months",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "oWfpYOzEv99",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 0-59 months",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 0-59 months",
			"description": "Population of children 0-4 years",
			"formName": "Pop 0-59 months",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "eaMftrC6OOx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 12-23 months",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 12-23 months",
			"formName": "Pop 12-23M",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "PokgBJdcthJ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 15-49 years female (WCBA)",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 15-49 years female (WCBA)",
			"description": "Population of women from 15-49 years, also known as Women of Child Bearing Age (WCBA). Used as a denominator for reproductive health. Captured annually",
			"formName": "Pop WCBA",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "oFCPlJ9wLjh",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 25-54 years",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 25-54 years",
			"formName": "Pop 25-54Y",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "kDfrnd0H4kp",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 55-64 years",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 55-64 years",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "lvaGZiISXlE",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population 65+ years",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop 65+ years",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "QuNmtaDWDsl",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population estimated live birth",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop estimated live birth",
			"description": "Population figure that falls between expected pregnant population and surviving infants. Also used as a proxy for expected deliveries",
			"formName": "Pop estimated live birth",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "fP4HZCN8qOy",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population estimated pregnant",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop estimated pregnant",
			"description": "Population of estimated pregnant population, i.e. the women who are expected to fall pregnant and need maternal services. This is normally based on population under 1 year but with a factor that includes miscarriges",
			"formName": "Pop estimated pregnant",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Ma8TjkWwvVs",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population pregnant lactating women",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop pregnant lactating women",
			"description": "Population that includes antenatal client and postnatal client",
			"formName": "Pop pregnant lactating women",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "b160WPcea0Y",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Population total",
			"translations": [],
			"sharing": {
				"owner": "tNRYPpONvG3",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pop total",
			"description": "Total population. Used as a denominator. Captured annually",
			"formName": "Pop total",
			"legendSets": [],
			"aggregationType": "AVERAGE_SUM_ORG_UNIT",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "QHszJHrLFgx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Prevalence of Stunting among children under 5 years",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Prevalence of Stunting among children < 5 years",
			"formName": "Prevalence of Stunting among children under 5 years of age",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "NUMBER",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "hCSIQmoGuk1",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Prevalence of Wasting among children under 5 years",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Prevalence of Wasting among children < 5 years",
			"formName": "Prevalence of wasting among children under 5 years of age",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "NUMBER",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "P5YkOyvJ37a",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Proportion of Births attended by Skilled Health personnel",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Births attended by Skilled Health personnel",
			"formName": "Proportion of Births attended by Skilled Health personnel",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "NUMBER",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "uuNiCcl5rgN",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "TB Incidence rate (per 100,000 population)",
			"translations": [],
			"sharing": {
				"owner": "nStjBuWydUM",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB Incidence rate (per 100,000 population)",
			"formName": "TB Incidence rate (per 100,000 population)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "PZ5N9C7XnQr",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "1a)  AZT+3TC+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1a)  AZT+3TC+NVP",
			"formName": "1a)  AZT+3TC+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "TclS1KLSij0",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1b) AZT+3TC+EFV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1b) AZT+3TC+EFV",
			"formName": "1b) AZT+3TC+EFV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "vOyQ17i84YS",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1c) TDF+3TC+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1c) TDF+3TC+NVP",
			"formName": "1c) TDF+3TC+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "PjLNEvHSxlO",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1d) TDF+3TC+EFV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1d) TDF+3TC+EFV",
			"formName": "1d) TDF+3TC+EFV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "gx4WkqyMugd",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1e) TDF+FTC+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1e) TDF+FTC+NVP",
			"formName": "1e) TDF+FTC+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "aBpTODk37rI",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1f) TDF+FTC+EFV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1f) TDF+FTC+EFV",
			"formName": "1f) TDF+FTC+EFV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Ng8zaOLv5TL",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1g) TDF+3TC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1g) TDF+3TC+DTG",
			"formName": "1g) TDF+3TC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "QwdHMhvj7HO",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1h) TDF+FTC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1h) TDF+FTC+DTG",
			"formName": "1h) TDF+FTC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "aQr5XI11Bkg",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1i) TDF+3TC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1i) TDF+3TC+ATV/r",
			"formName": "1i) TDF+3TC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "OkLCyHj89EX",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "1k) TDF+FTC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "1k) TDF+FTC+ATV/r",
			"formName": "1k) TDF+FTC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "PMsKvxqFXkj",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2a) AZT+3TC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2a) AZT+3TC+LPV/r",
			"formName": "2a) AZT+3TC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "nci3mv40F3C",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2b) AZT+3TC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2b) AZT+3TC+ATV/r",
			"formName": "2b) AZT+3TC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "aHzFsotyj2Q",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2c) TDF+3TC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2c) TDF+3TC+LPV/r",
			"formName": "2c) TDF+3TC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "t3e5N2AQAKB",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2d) TDF+3TC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2d) TDF+3TC+ATV/r",
			"formName": "2d) TDF+3TC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "KJArtkDBnzP",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2e) TDF+FTC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2e) TDF+FTC+LPV/r",
			"formName": "2e) TDF+FTC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "kAmnuZrVWdn",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2f) TDF+FTC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2f) TDF+FTC+ATV/r",
			"formName": "2f) TDF+FTC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "GpyCjhlS0iF",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2g) TDF+3TC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2g) TDF+3TC+DTG",
			"formName": "2g) TDF+3TC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Ss43YjOF69E",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "2h) TDF+FTC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "2h) TDF+FTC+DTG",
			"formName": "2h) TDF+FTC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "wkFOl4LFowJ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4a)  AZT+3TC+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4a)  AZT+3TC+NVP",
			"formName": "4a)  AZT+3TC+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "I6TAA1XOD20",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4b) AZT+3TC+EFV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4b) AZT+3TC+EFV",
			"formName": "4b) AZT+3TC+EFV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "KrppwrfSqEd",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4c) ABC+3TC+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4c) ABC+3TC+NVP",
			"formName": "4c) ABC+3TC+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "eoehrO6qziX",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4d) ABC+3TC+EFV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4d) ABC+3TC+EFV",
			"formName": "4d) ABC+3TC+EFV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "pxpPWqqe6QU",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4e) ABC+3TC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4e) ABC+3TC+DTG",
			"formName": "4e) ABC+3TC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "V6VevHG0zZX",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4f) ABC+3TC+LPV",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4f) ABC+3TC+LPV",
			"formName": "4f) ABC+3TC+LPV",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "YV8hAGIAU4V",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4g) ABC+3TC+RAL",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4g) ABC+3TC+RAL",
			"formName": "4g) ABC+3TC+RAL",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "JlBoayX8cd0",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4h) AZT+3TC+RAL",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4h) AZT+3TC+RAL",
			"formName": "4h) AZT+3TC+RAL",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "zHX6cB9Rwfc",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "4i) AZT+3TC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "4i) AZT+3TC+LPV/r",
			"formName": "4i) AZT+3TC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "LeHtn8uGUSs",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5a) AZT+3TC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5a) AZT+3TC+LPV/r",
			"formName": "5a) AZT+3TC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "RfPIbC64SJI",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5b) AZT+3TC+ATV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5b) AZT+3TC+ATV/r",
			"formName": "5b) AZT+3TC+ATV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "ggbR5TMNZBp",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5c) ABC+3TC+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5c) ABC+3TC+LPV/r",
			"formName": "5c) ABC+3TC+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "nuM54fiwEOv",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5d) ABC+ddI+LPV/r",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5d) ABC+ddI+LPV/r",
			"formName": "5d) ABC+ddI+LPV/r",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "eptbKlOnAgq",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5e) ABC+3TC+ddI",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5e) ABC+3TC+ddI",
			"formName": "5e) ABC+3TC+ddI",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "tSkROvx5b1L",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5f) ddI+LPV/r+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5f) ddI+LPV/r+NVP",
			"formName": "5f) ddI+LPV/r+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "KUTZXckpgRs",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5g) ddI+LPV/r+NVP",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5g) ddI+LPV/r+NVP",
			"formName": "5g) ddI+LPV/r+NVP",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Hu4oGLuvK5u",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5h) TCF+3TC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5h) TCF+3TC+DTG",
			"formName": "5h) TCF+3TC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "LBqeE9Xw6Ka",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "5i) TCF+FTC+DTG",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "5i) TCF+FTC+DTG",
			"formName": "5i) TCF+FTC+DTG",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Xy7cNwWwrFx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "FPWZ6D5JUqi"
			}
		},
		{
			"name": "ART care -  cumulative STARTED",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ART care -  cumulative STARTED",
			"formName": "ART care - cumulative STARTED",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "BIw6zakyjy8",
			"attributeValues": [],
			"categoryCombo": {
				"id": "U8C9cppcRom"
			}
		},
		{
			"name": "ART care -  cumulative STARTED, Male",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ART care -  cumulative STARTED, Male",
			"formName": "ART care - cumulative STARTED, Male",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "ulANYHeHWfr",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "ART care - new STARTED",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ART care - new STARTED",
			"formName": "ART care - new STARTED",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "QtQNx2fcjE6",
			"attributeValues": [],
			"categoryCombo": {
				"id": "U8C9cppcRom"
			}
		},
		{
			"name": "ART care - new STARTED, Male",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ART care - new STARTED, Male",
			"formName": "ART care - new STARTED, Male",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "VnuYdXMF8cI",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "Antenatal client 1st visit",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1st visit",
			"description": "Antenatal client 1st visit to health facility for start of care during this pregnancy. A national policy dictates what services are done during this visit",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": true,
			"id": "L4EsISvd1Hu",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client 1st visit screened for syphilis",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1st visit screened syphilis",
			"description": "ANC 1st visit where the blood is taken for syphilis screening, either to a laboratory or a rapid test",
			"formName": "ANC 1st visit screened syphilis",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "BzdkO9tAKpE",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client 1st visit under 12 weeks",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 1st visit under 12 weeks",
			"description": "ANC 1st visit that occurs within the 1st trimester, ie 12 weeks of pregnancy",
			"formName": "ANC 1st visit under 12 weeks",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Y0bt1niBB2g",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client 4th visit",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 4th visit",
			"description": "Antenatal client 4th visit according to the national policy",
			"formName": "ANC 4th visit",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Bl9cq5ZpeU5",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client 5th+ visit",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC 5th+ visit",
			"description": "Antenatal client 5th or more visits according to the national policy",
			"formName": "ANC 5th+ visit",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "pK0TIVasXca",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client HIV positive",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC client HIV positive",
			"formName": "ANC client partner HIV positive",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "V3QJWuKWcMN",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "Antenatal client HIV tested",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Antenatal client HIV tested",
			"formName": "ANC client HIV status unknown counselled/tested/given result",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "twoOM8l9rzj",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "Antenatal client Iron Folic Acid 1st Supply",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC IFA 1st Supply",
			"description": "Antenatal client given Iron Folic Acid supplementation 1st supply with each supply consisting of 90 tablets",
			"formName": "ANC IFA 1st Supply",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "ww7a9OBJjEx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client LLITN",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC LLITN",
			"description": "Antenatal client given a LLITN, normally at the ANC 1st visit",
			"formName": "ANC LLITN",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "kKSbIF30VXo",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Antenatal client deworming medication",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "ANC deworming medication",
			"description": "Antenatal client given dose of deworming medication",
			"formName": "ANC deworming medication",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "BliZZWc30Ab",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "BCG dose (Bacillus Calmete-Guerin)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "BCG dose",
			"description": "Bacillus Calmete-Guerin (BCG) given to infants to prevent tuberculosis. It is best given within 3 months of birth",
			"formName": "BCG dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "WMs1OfiqmYO",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "Delivery assisted vaginal (Instrumental/Ventouse)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery assisted vaginal",
			"description": "Vaginal delivery that was assisted with either forceps (Instruments) or vacuum (Ventouse)",
			"formName": "Delivery assisted vaginal (Instrumental/Ventouse)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "PIZQsdZsmMn",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Z3NmRhFJjig"
			}
		},
		{
			"name": "Delivery by Caesarian Section",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Caesarian Section",
			"description": "Delivery done by surgically opening the uterus to extract the infant, usually done for obstetric emergencies",
			"formName": "Caesarian Section",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Xm3C6o5ntcW",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Z3NmRhFJjig"
			}
		},
		{
			"name": "Delivery by SBA (Doctor, Midwife, Nurse midwife)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery by SBA (Doctor, Midwife, Nurse midwife)",
			"description": "Delivery by SBA (Doctor, Midwife, Nurse midwife)",
			"formName": "Delivery by SBA (Doctor, Midwife, Nurse midwife)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "muZ9mQLjnNw",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Delivery by other cadres (CHW, Auxiliary MW, etc.) ",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery by other cadres ",
			"description": "Delivery by other cadres (CHW, Auxiliary MW, etc.) ",
			"formName": "Delivery by other cadres (CHW, Auxiliary MW, etc.) ",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "fgk97Prvsn2",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Delivery normal",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Delivery normal",
			"description": "Process of expulsion of foetus and placenta through the vagina. This can include any breech delivery",
			"formName": "Normal Delivery",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "O7WEUv1n6RF",
			"attributeValues": [],
			"categoryCombo": {
				"id": "Z3NmRhFJjig"
			}
		},
		{
			"name": "Fever case ANC tested for Malaria (Microscopy)",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Fever case ANC tested Malaria (Micro)",
			"formName": "Fever case ANC tested Malaria (Micro)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "FcUoFRzeKTQ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "SY4hEyGR4rk"
			}
		},
		{
			"name": "Fever case ANC tested for Malaria (RDT)",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Fever case ANC tested Malaria (RDT)",
			"formName": "ANC Fever case tested Malaria (RDT)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "BFgB4NC3Tdt",
			"attributeValues": [],
			"categoryCombo": {
				"id": "SY4hEyGR4rk"
			}
		},
		{
			"name": "Fever case tested for Malaria RDT",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Fever case tested for Malaria RDT",
			"description": "Client presenting with signs and symptoms of Malaria tested using RDT (Rapid Diagnostic Test)",
			"formName": "Fever case tested for Malaria RDT",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": true,
			"id": "IkG4ksC9khS",
			"attributeValues": [],
			"categoryCombo": {
				"id": "O66Uhf9orEs"
			}
		},
		{
			"name": "Fever case tested for Malaria microscopy",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Fever case tested Malaria microscopy",
			"description": "Client presenting with signs and symptoms of Malaria tested using bloos smear and microscopy",
			"formName": "Fever case tested Malaria microscopy",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": true,
			"id": "zPPwJ27VBb9",
			"attributeValues": [],
			"categoryCombo": {
				"id": "O66Uhf9orEs"
			}
		},
		{
			"name": "HIV Care (Pre-ART) cumulative persons ENROLLED",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Care  cumulative persons ENROLLED",
			"formName": "HIV Care cumulative persons ENROLLED",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "Wq7UXiV0MMU",
			"attributeValues": [],
			"categoryCombo": {
				"id": "U8C9cppcRom"
			}
		},
		{
			"name": "HIV Care (Pre-ART) cumulative persons ENROLLED, Male",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Care  cumulative persons ENROLLED, Male",
			"formName": "HIV Care cumulative persons ENROLLED, Male",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "SbnfVHd0rIM",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "HIV Care (Pre-ART) new persons ENROLLED",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Care new  persons ENROLLED",
			"formName": "HIV Care new  persons ENROLLED",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "xJbK61DDfKJ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "U8C9cppcRom"
			}
		},
		{
			"name": "HIV Care (Pre-ART) new persons ENROLLED, Male",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "HIV Care new  persons ENROLLED, Male",
			"formName": "HIV Care new  persons ENROLLED, Male",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "rA20gX7PMvx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "qZqUtliSZC7"
			}
		},
		{
			"name": "Live birth in facility",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Live birth in facility",
			"description": "Live birth in facility",
			"formName": "Live birth in facility",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "EbzB7NBlL7B",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "MDR TB Treatment Outcome",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "MDR TB Treatment Outcome",
			"description": "Outcomes of clients with MDR on short and long term regimens",
			"formName": "Treatment Outcome for MDR TB",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "tGCFfM5IdT9",
			"attributeValues": [],
			"categoryCombo": {
				"id": "IsAP6hqtigF"
			}
		},
		{
			"name": "Malaria confirmed treated with ACT",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Malaria confirmed treated with ACT",
			"description": "Client with confirmed Malaria (either RDT or microscopy) treated with ACT in accordance with national policy",
			"formName": "Malaria confirmed treated with ACT",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "X5VcweyOXty",
			"attributeValues": [],
			"categoryCombo": {
				"id": "G1CikDASbWN"
			}
		},
		{
			"name": "Measles/Rubella 1st dose",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Measles/Rubella 1st dose",
			"description": "Measles/Rubella 1st dose",
			"formName": "Measles/Rubella 1st dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "hzD1f9bAoCQ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "Measles/Rubella 2nd dose",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Measles/Rubella 2nd dose",
			"description": "Measles/Rubella 2nd dose",
			"formName": "Measles/Rubella 2nd dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "yE5NyMHazNx",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "New & relapse client registered",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "New & relapse client registered",
			"formName": "New & relapse client registered",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "kNHsjHicMAn",
			"attributeValues": [],
			"categoryCombo": {
				"id": "mdNsQiTaR30"
			}
		},
		{
			"name": "OPV 0 dose",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "OPV 0 dose",
			"description": "OPV 0 dose",
			"formName": "OPV 0 dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "eR4Ojj6nRYS",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "Pentavalent 1st dose",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pentavalent 1st dose",
			"description": "Pentavalent 1st dose",
			"formName": "Pentavalent 1st dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": true,
			"id": "zhxRZPwaIfT",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "Pentavalent 3rd dose",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Pentavalent 3rd dose",
			"description": "Pentavalent 3rd dose",
			"formName": "Pentavalent 3rd dose",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "uVIZtOjcqtR",
			"attributeValues": [],
			"categoryCombo": {
				"id": "fKGtwamkPYq"
			}
		},
		{
			"name": "Postnatal mother 1st visit (0-48 hrs)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Postnatal mother 1st visit (0-48 hrs)",
			"description": "Postnatal mother 1st visit (0-48 hrs)",
			"formName": "Postnatal mothers 1st visit (0- 48 hrs)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "DgJergzdmfd",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Postnatal neonate 1st visit (0-48 hrs)",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Postnatal neonate 1st visit (0-48 hrs)",
			"description": "Postnatal neonate 1st visit (0-48 hrs)",
			"formName": "Postnatal neonate 1st visit (0-48 hrs)",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "OMtkRAJmDN8",
			"attributeValues": [],
			"categoryCombo": {
				"id": "hMeN7svaJ6E"
			}
		},
		{
			"name": "Still birth fresh in facility",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Still birth fresh in facility",
			"description": "Still birth fresh in facility",
			"formName": "Still birth fresh in facility",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "umt6ky0nJPZ",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Still birth macerated in facility",
			"translations": [],
			"sharing": {
				"owner": "UfNjOCWbr1G",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Still birth macerated in facility",
			"description": "Still birth macerated in facility",
			"formName": "Still birth macerated in facility",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "JDFy9CeJsxK",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "Suspect Public* referred",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Suspect Public* referred",
			"formName": "Suspect Public* referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "JoOZV47stNr",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "Suspect community referred",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Suspect community referred",
			"formName": "Suspect community referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "LZd3tP0n7VW",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "Suspect household contact referred",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Suspect household contact referred",
			"formName": "Suspect household contact referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "F6r51xXuKBk",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "Suspect other referred",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Suspect other referred",
			"formName": "Suspect other referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "chgDtavhYKc",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "Suspect self referred",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Suspect self referred",
			"formName": "Suspect self referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "QojtRgeugv5",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "TB Suspect Private referral",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB Suspect Private referral",
			"description": "Referral from a private clinic due to suspected TB",
			"formName": "Suspect Private referred",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "h40UrmXDIvK",
			"attributeValues": [],
			"categoryCombo": {
				"id": "VKO6kScGSzq"
			}
		},
		{
			"name": "TB TO Bacteriologically confirmed, new and relapse",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB TO Bacteriology confirmed, new and relapse",
			"description": "Treatment outcome of TB clients who were bacteriologically confirmed",
			"formName": "TB TO Bacteriology confirmed, new and relapse",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "w671v6XvLRN",
			"attributeValues": [],
			"categoryCombo": {
				"id": "dAkDV55NUhM"
			}
		},
		{
			"name": "TB TO Bacteriologically confirmed, new and relapse registered 4 quarters ago",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB TO Bacteriology confirmed registered 4 qrs back",
			"description": "Treatment outcomes of TB confirmed registered 4 quarters back. This is for clients who were both new cases and relapses",
			"formName": "Bacteriologically confirmed, new and relapse registered 4 quarters ago",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "prBc2HALp3D",
			"attributeValues": [],
			"categoryCombo": {
				"id": "bjDvmb4bfuf"
			}
		},
		{
			"name": "TB TO Clinically diagnosed, new and relapse",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "TB TO Clinically diagnosed, new and relapse",
			"description": "Used for assessing treatment outcomes of clients who were clinically diagnosed, either new or relapse ",
			"formName": "TO Clinically diagnosed, new and relapse",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "kWGR7GUE9Lu",
			"attributeValues": [],
			"categoryCombo": {
				"id": "dAkDV55NUhM"
			}
		},
		{
			"name": "Tested HIV positive",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Tested HIV positive",
			"formName": "Tested HIV positive",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": false,
			"id": "waIzDrZ83kX",
			"attributeValues": [],
			"categoryCombo": {
				"id": "m6QjrSd6nz6"
			}
		},
		{
			"name": "Tested for HIV and given results",
			"translations": [],
			"sharing": {
				"owner": "i7O1vBciNb8",
				"external": false,
				"users": {},
				"userGroups": {},
				"public": "rw------"
			},
			"shortName": "Tested for HIV and given results",
			"formName": "Tested for HIV and given results",
			"legendSets": [],
			"aggregationType": "SUM",
			"valueType": "INTEGER_ZERO_OR_POSITIVE",
			"domainType": "AGGREGATE",
			"aggregationLevels": [],
			"zeroIsSignificant": true,
			"id": "a5biGY0G6EK",
			"attributeValues": [],
			"categoryCombo": {
				"id": "m6QjrSd6nz6"
			}
		}
	]
}


async function extractUniqueMappings(data: any) {
	const mappingSet = new Map();

	// Helper to add item to map (avoiding duplicates)
	const addToMapping = (item: any) => {
		if (!mappingSet.has(item)) {
			mappingSet.set(item, { sourceId: item, id: item });
		}
	};

	// Regex to match all #{...} patterns
	const extractIdsFromExpression = (expression = '') => {
		const regex = /#\{([^}]+)\}/g;
		let match;
		while ((match = regex.exec(expression)) !== null) {
			addToMapping(match[1]);
		}
	};

	// Process indicators
	if (Array.isArray(data.indicators)) {
		data.indicators.forEach((indicator: any) => {
			extractIdsFromExpression(indicator.numerator);
			extractIdsFromExpression(indicator.denominator);
		});
	}

	// Process dataElements if present
	if (Array.isArray(data.dataElements)) {
		data.dataElements.forEach((element: any) => {
			if (element.id) addToMapping(element.id);
		});
	}

	// Convert map to array
	return Array.from(mappingSet.values());
}

const mapping = await extractUniqueMappings(dataItems);

logger.info(`Extracted ${mapping.length} unique mappings.`);

const fileLocation = `./mapping.json`;

await fs.promises.writeFile(
	fileLocation,
	JSON.stringify(mapping, null, 2),
	'utf8'
);

logger.info(`Mapping file written to ${fileLocation}`);

export { };

