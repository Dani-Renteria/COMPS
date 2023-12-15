import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "../styles/InputForm.css";
import batters from "../files/hittersByGame.csv";
import pitchers from "../files/pitchersByGame.csv";
import pitches from "../files/pitches(smaller).csv";
import mvp from "../files/mvp.csv";
import playerIcon from "../images/baseball-15 1player.svg";
import pitcherIcon from "../images/pitch-15 2pitchIcon.svg";

function InputForm() {
  const [batter, setBatter] = useState("");

  const [batterData, setBatterData] = useState([]);
  const [batterSug, setBatterSug] = useState([]);

  const [pitcherData, setPitcherData] = useState([]);
  const [pitcherSug, setPitcherSug] = useState([]);

  const [hits, setHits] = useState("");
  const [bats, setBats] = useState("");

  const [balls, setBalls] = useState("");
  const [strikes, setStrikes] = useState("");

  const [pitcher, setPitcher] = useState("");
  const [innings, setInnings] = useState("");
  const [runs, setRuns] = useState("");
  const [speed, setSpeed] = useState("");

  const [result, setResult] = useState([]);
  const [resultP, setResultP] = useState([]);
  const [liveResult, setLiveResult] = useState([]);
  const [liveResultP, setLiveResultP] = useState([]);

  const [showPitcherLive, setShowPitcherLive] = useState(true);
  const [showPitcher, setShowPitcher] = useState(true);

  const [showBatterLive, setShowBatterLive] = useState(true);
  const [showBatter, setShowBatter] = useState(true);

  const toggleLivePitcher = () => {
    setShowPitcherLive(!showPitcherLive);
  };
  const togglePitcher = () => {
    setShowPitcher(!showPitcher);
  };
  const toggleLiveBatter = () => {
    setShowBatterLive(!showBatterLive);
  };
  const toggleBatter = () => {
    setShowBatter(!showBatter);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(batters);
        const text = await response.text();
        const result = Papa.parse(text, { header: true });

        const responseP = await fetch(pitchers);
        const textP = await responseP.text();
        const resultP = Papa.parse(textP, { header: true });

        setPitcherData(resultP.data);
        setBatterData(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setBatter(input);
    const uniqueResults = [];

    batterData
      .filter((batter) =>
        batter.Hitters.toLowerCase().includes(input.toLowerCase())
      )
      .forEach((batter) => {
        const playerName = batter.Hitters.toLowerCase();
        if (
          !uniqueResults.some(
            (result) => result.Hitters.toLowerCase() === playerName
          )
        ) {
          uniqueResults.push(batter);
        }
      });

    setBatterSug(uniqueResults);
  };

  const handlePInputChange = (e) => {
    const input = e.target.value;
    setPitcher(input);

    const uniquePResults = [];
    pitcherData
      .filter((pitcher) =>
        pitcher.Pitchers.toLowerCase().includes(input.toLowerCase())
      )
      .forEach((pitcher) => {
        const playerName = pitcher.Pitchers.toLowerCase();
        if (
          !uniquePResults.some(
            (result) => result.Pitchers.toLowerCase() === playerName
          )
        ) {
          uniquePResults.push(pitcher);
        }
      });

    setPitcherSug(uniquePResults);
  };

  const onSearch = (searchItem) => {
    setBatter(searchItem);
  };

  const onPSearch = (searchItem) => {
    setPitcher(searchItem);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isNaN(hits) && !isNaN(bats)) {
      fetchData(batter, hits, bats);
    } else {
      setResult("Invalid input!");
    }
  };

  const handleBatterLive = (e) => {
    e.preventDefault();
    if (!isNaN(hits) && !isNaN(bats)) {
      fetchBatterLive(batter, hits, bats);
    } else {
      setResult("Invalid input!");
    }
  };

  const handlePitcherSubmit = (e) => {
    e.preventDefault();
    if (!isNaN(runs) && !isNaN(innings)) {
      fetchPitcherData(pitcher);
    } else {
      setResultP("Invalid input!");
    }
  };

  const handleLivePitcherSubmit = (e) => {
    e.preventDefault();
    if (!isNaN(runs) && !isNaN(innings)) {
      fetchPitcherLive(pitcher, innings, runs, balls, strikes);
    } else {
      setResultP("Invalid input!");
    }
  };

  async function fetchData(name, hits, bats) {
    try {
      const response = await fetch(batters);
      const text = await response.text();
      const result = Papa.parse(text, { header: true });
      const reversedData = result.data.reverse();
      let newAve = 0;

      const response2 = await fetch(mvp);
      const text2 = await response2.text();
      const result2 = Papa.parse(text2, { header: true });

      const nameParts = name.split(" ");
      const modifiedName = nameParts[0].slice(2) + (nameParts[1] || "");

      const filteredRowsMVP = result2.data.filter((row) => {
        console.log("MVP is");
        return Object.values(row).some((value) => value.includes(modifiedName));
      });

      if (filteredRowsMVP.length > 0) {
        console.log("in the mvp section");
        const firstRow = filteredRowsMVP[0];
        const yearValue = firstRow.Year;
        const statsValue = firstRow.Stats;
        const leagueValue = firstRow.League;

        const comment =
          yearValue +
          " Most Valuable Player. STATS: " +
          statsValue +
          ". LEAGUE: " +
          leagueValue;
        setResult((result) => [
          { type: "Award:", name: name, value: comment },
          ...result,
        ]);
      }

      const filteredRows = reversedData.filter((row) => {
        return Object.values(row).some((value) => value.includes(name));
      });

      const highestAvgFind = filteredRows.map((row) => {
        const avgValue = parseFloat(row["AVG"]);
        return isNaN(avgValue) ? 0 : avgValue;
      }, 0);

      const highestAvg = Math.max(...highestAvgFind);

      const highestOn = filteredRows.reduce((maxOn, row) => {
        const avgOValue = parseFloat(row["OBP"]);
        return avgOValue > maxOn ? avgOValue : maxOn;
      }, 0);

      const commentHighOBP =
        "Current ON BASE PERCENTAGE CAREER HIGH is: " + highestOn;
      setResult((result) => [
        { type: "Overview:", name: name, value: commentHighOBP },
        ...result,
      ]);

      const commentHigh =
        "Current BATTING AVERAGE CAREER HIGH is: " + highestAvg;
      setResult((result) => [
        { type: "Overview:", name: name, value: commentHigh },
        ...result,
      ]);

      for (const row of filteredRows) {
        const hValue = row["H"];
        const abValue = row["AB"];
        const currAve = parseFloat(row["AVG"]);
        const position = row["Position"];
        const team = row["Team"];

        const commentAve =
          "Current BATTING AVERAGE is: " +
          currAve +
          "\n\n POSITION: " +
          position +
          " TEAM: " +
          team;
        setResult((result) => [
          { type: "Overview:", name: name, value: commentAve },
          ...result,
        ]);

        const onBasePecentage = parseFloat(row["OBP"]);

        if (abValue > 0) {
          newAve = (hValue + hits) / (abValue + bats);
        }
        const formattedAve = newAve.toFixed(2);

        if (onBasePecentage > 0) {
          const formattedOBP = onBasePecentage.toFixed(2);
          if (onBasePecentage > 0.37) {
            const comment =
              "Current ON BASE PERCENTAGE is: " +
              formattedOBP +
              ". Rating: EXCELLENT!";
            setResult((result) => [
              { type: "Overview:", name: name, value: comment },
              ...result,
            ]);
          } else if (onBasePecentage >= 0.34 && onBasePecentage <= 0.37) {
            const comment =
              "Current ON BASE PERCENTAGE is: " +
              formattedOBP +
              ". Rating: Great.";
            setResult((result) => [
              { type: "Overview:", name: name, value: comment },
              ...result,
            ]);
          } else if (onBasePecentage > 0.31 && onBasePecentage < 0.34) {
            const comment =
              "Current ON BASE PERCENTAGE is: " +
              formattedOBP +
              ". Rating: Average.";
            setResult((result) => [
              { type: "Overview:", name: name, value: comment },
              ...result,
            ]);
          } else {
            const comment =
              "Current ON BASE PERCENTAGE is: " +
              formattedOBP +
              ". Rating: POOR.";
            setResult((result) => [
              { type: "Overview:", name: name, value: comment },
              ...result,
            ]);
          }
          return newAve;
        }
        if (formattedAve > currAve && bats > 0) {
          let diff = newAve - currAve;
          let updatedAve = (newAve + currAve) / 2;
          let percentage = (diff / currAve) * 10;
          const formattedPer = percentage.toFixed(2);
          const comment =
            name +
            "'s (UPDATED) batting average is: " +
            updatedAve +
            ". Overall " +
            formattedPer +
            "% increase.";

          console.log("in the if statment");
          setResult((result) => [comment, ...result]);
          if (formattedAve > highestAvg) {
            const comment = name + "'s batting average is a new season high!";
            setResult((result) => [comment, ...result]);
            return newAve;
          } else {
            return newAve;
          }
        } else if (bats > 0) {
          let diff = newAve - currAve;
          let updatedAve = (newAve + currAve) / 2;
          let percentage = (diff / currAve) * 10;
          const formattedPer = percentage.toFixed(2);
          const comment =
            name +
            "'s (UPDATED) batting average is: " +
            updatedAve +
            ". Overall a " +
            formattedPer +
            "% decrease.";
          setResult((result) => [comment, ...result]);
          console.log(result);
          return newAve;
        }
        return newAve;
      }

      return Promise.resolve(newAve);
    } catch (error) {
      console.error("Error fetching data:", error);
      return Promise.reject("Error fetching data");
    }
  }

  async function fetchBatterLive(name, hits, bats) {
    try {
      const response = await fetch(batters);
      const text = await response.text();
      const result = Papa.parse(text, { header: true });
      const reversedData = result.data.reverse();
      let newAve = 0;

      const filteredRows = reversedData.filter((row) => {
        return Object.values(row).some((value) => value.includes(name));
      });

      const highestAvgFind = filteredRows.map((row) => {
        const avgValue = parseFloat(row["AVG"]);
        return isNaN(avgValue) ? 0 : avgValue;
      }, 0);
      const highestAvg = Math.max(...highestAvgFind);

      for (const row of filteredRows) {
        if (hits > 0 && bats > 0) {
          const hValue = row["H"];
          const abValue = row["AB"];
          newAve = (hValue + hits) / (abValue + bats);
          const formattedAve = newAve.toFixed(2);
          console.log(formattedAve);
          if (formattedAve > highestAvg) {
            const comment =
              "Live BATTING AVERAGE: " + formattedAve + ". New CAREER HIGH!";
            setLiveResult((liveResult) => [
              { type: "Award:", name: name, value: comment },
              ...liveResult,
            ]);
          } else {
            const comment = "Live BATTING AVERAGE: " + formattedAve;
            setLiveResult((liveResult) => [
              { type: "Award:", name: name, value: comment },
              ...liveResult,
            ]);
          }
          return newAve;
        }

        return newAve;
      }

      return Promise.resolve(newAve);
    } catch (error) {
      console.error("Error fetching data:", error);
      return Promise.reject("Error fetching data");
    }
  }

  async function fetchPitcherData(name) {
    try {
      const response = await fetch(pitchers);
      const text = await response.text();
      const result = Papa.parse(text, { header: true });
      const reversedData = result.data.reverse();
      let newAve = 0;

      const response2 = await fetch(mvp);
      const text2 = await response2.text();
      const result2 = Papa.parse(text2, { header: true });

      const nameParts = name.split(" ");
      const modifiedName = nameParts[0].slice(2) + (nameParts[1] || "");

      const filteredRowsMVP = result2.data.filter((row) => {
        return Object.values(row).some((value) => value.includes(modifiedName));
      });

      if (filteredRowsMVP.length > 0) {
        const firstRow = filteredRowsMVP[0];
        const yearValue = firstRow.Year;
        const statsValue = firstRow.Stats;
        const leagueValue = firstRow.League;

        const comment =
          yearValue +
          " Most Valuable Player. STATS: " +
          statsValue +
          ". LEAGUE: " +
          leagueValue;
        setResultP((resultP) => [
          { type: "Award:", name: name, value: comment },
          ...resultP,
        ]);
      }

      const filteredRows = reversedData.filter((row) => {
        return Object.values(row).some((value) => value.includes(name));
      });

      const lowestERA = filteredRows.reduce((min, row) => {
        const eraValue = parseFloat(row["ERA"]);
        return eraValue < min ? eraValue : min;
      }, 0);

      const highestERA = filteredRows.reduce((max, row) => {
        const eraValue = parseFloat(row["ERA"]);
        return eraValue > max ? eraValue : max;
      }, 0);

      const commentLow =
        "Current EARNED RUN AVERAGE career BEST is: " + lowestERA;
      setResultP((resultP) => [
        { type: "Overview:", name: name, value: commentLow },
        ...resultP,
      ]);

      const commentHigh =
        "Current EARNED RUN AVERAGE career WORST is: " + highestERA;
      setResultP((resultP) => [
        { type: "Overview:", name: name, value: commentHigh },
        ...resultP,
      ]);

      for (const row of filteredRows) {
        const walkValue = row["BB"];
        const strikeOutValue = row["K"];
        const currAve = parseFloat(row["ERA"]);
        const pitchesRatio = row["PC-ST"];

        const commentAve = "Current EARNED RUN AVERAGE is: " + currAve;
        setResultP((resultP) => [
          { type: "Overview:", name: name, value: commentAve },
          ...resultP,
        ]);

        const commentPitches =
          "Current PITCHES to STRIKES RATIO is: " + pitchesRatio;
        setResultP((resultP) => [
          { type: "Overview:", name: name, value: commentPitches },
          ...resultP,
        ]);

        if (!isNaN(strikeOutValue)) {
          if (strikeOutValue > walkValue) {
            let percentage =
              (strikeOutValue / (strikeOutValue + walkValue)) * 100;
            let formatted = percentage.toFixed(0);

            const comment =
              "Current STRIKE OUT to WALK RATIO is: +" +
              formatted +
              "% STRIKE OUTS!";
            setResultP((resultP) => [
              { type: "Overview:", name: name, value: comment },
              ...resultP,
            ]);
          } else {
            let percentage = (walkValue / (strikeOutValue + walkValue)) * 100;
            let formatted = percentage.toFixed(1);

            const comment =
              "Current STRIKE OUT to WALK RATIO is: -" + formatted + "% WALKS!";
            setResultP((resultP) => [
              { type: "Overview:", name: name, value: comment },
              ...resultP,
            ]);
          }
        }

        return newAve;
      }

      return Promise.resolve(newAve);
    } catch (error) {
      console.error("Error fetching data:", error);
      return Promise.reject("Error fetching data");
    }
  }

  async function fetchPitcherLive(name, innings, runs, balls, strikes) {
    try {
      const response = await fetch(pitches);
      const text = await response.text();
      const result = Papa.parse(text, { header: true });

      const response2 = await fetch(pitchers);
      const text2 = await response2.text();
      const result2 = Papa.parse(text2, { header: true });
      const reversedData = result2.data.reverse();

      const nameParts = name.split(" ");
      const modifiedName = nameParts[0].slice(2) + (nameParts[1] || "");

      let newAve = 0;

      const filteredRowsPitchers = reversedData.filter((row) => {
        return Object.values(row).some((value) => value.includes(name));
      });

      if (balls === "3" && strikes === "2") {
        console.log("3-2 count");
        const filteredRows = result.data.filter((row) => {
          return Object.values(row).some((value) =>
            value.includes(modifiedName)
          );
        });
        const typeOccurrences = {};

        filteredRows.forEach((row) => {
          const typeValue = row.Type;

          if (typeOccurrences[typeValue]) {
            typeOccurrences[typeValue]++;
          } else {
            typeOccurrences[typeValue] = 1;
          }
        });

        let mostCommonType = null;
        let maxOccurrences = 0;

        for (const typeValue in typeOccurrences) {
          if (typeOccurrences[typeValue] > maxOccurrences) {
            mostCommonType = typeValue;
            maxOccurrences = typeOccurrences[typeValue];
          }
        }

        if (mostCommonType !== null) {
          const comment =
            "MOST COMMON type of PITCH when faced with a 3-2 pitch count is: " +
            mostCommonType +
            " with " +
            maxOccurrences +
            " occurances";
          setLiveResultP((liveResultP) => [
            { type: "Live:", name: name, value: comment },
            ...liveResultP,
          ]);
        }

        const speedValues = filteredRows
          .map((row) => parseFloat(row.MPH))
          .filter((value) => !isNaN(value));

        if (speedValues.length > 0) {
          const sum = speedValues.reduce(
            (value, currentValue) => value + currentValue
          );
          const average = sum / speedValues.length;
          const aveFormat = average.toFixed(1);

          const comment =
            "AVERAGE SPEED when faced with a 3-2 pitch count is: " +
            aveFormat +
            " MPH";
          setLiveResultP((liveResultP) => [
            { type: "Live:", name: name, value: comment },
            ...liveResultP,
          ]);
        }
      }
      if (innings > 0 && runs > 0) {
        for (const row of filteredRowsPitchers) {
          const inningsVal = parseFloat(row["IP"]);
          const runsEarned = parseInt(row["ER"], 10);
          const runs2 = runsEarned + parseInt(runs);
          const innings2 = inningsVal + parseFloat(innings);
          const newEra = (runs2 / innings2) * 9;
          const era = newEra.toFixed(1);

          const comment = "Current EARNED RUN AVERAGE is: " + era;
          setLiveResultP((liveResultP) => [
            { type: "Live:", name: name, value: comment },
            ...liveResultP,
          ]);
          return newAve;
        }
      }

      return Promise.resolve(newAve);
    } catch (error) {
      console.error("Error fetching data:", error);
      return Promise.reject("Error fetching data");
    }
  }

  const clearItem = (index) => {
    const updatedItems = [
      ...result.slice(0, index),
      ...result.slice(index + 1),
    ];
    setResult(updatedItems);
  };

  const clearItemP = (index) => {
    const updatedItems = [
      ...resultP.slice(0, index),
      ...resultP.slice(index + 1),
    ];
    setResultP(updatedItems);
  };

  const clearLiveItemP = (index) => {
    const updatedItems = [
      ...liveResultP.slice(0, index),
      ...liveResultP.slice(index + 1),
    ];
    setLiveResultP(updatedItems);
  };

  const clearLiveItem = (index) => {
    const updatedItems = [
      ...liveResult.slice(0, index),
      ...liveResult.slice(index + 1),
    ];
    setLiveResult(updatedItems);
  };

  const clearAllItems = () => {
    setResult([]);
    setResultP([]);
    setLiveResultP([]);
    setLiveResult([]);
  };

  const clearAllBatters = () => {
    setResult([]);
    setLiveResult([]);
  };

  const clearAllPitchers = () => {
    setResultP([]);
    setLiveResultP([]);
  };

  const scrollTo = (elementID) => {
    const pcElement = document.getElementById(elementID);
    if (pcElement) {
      pcElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pageContainer">
      <div className="contentContainer">
        <div className="inputContainer">
          <div className="logo" />
          <div className="liveTitle">Live input</div>
          <div className="formContainer">
            <form method="post" onSubmit={handleSubmit} className="batter">
              <div className="batterName batterUp">
                <div className="title spacer">Batter Up: </div>
                <input
                  className="formIn"
                  type="text"
                  autocomplete="off"
                  name="batter"
                  id=" "
                  onChange={handleInputChange}
                  value={batter}
                  placeholder="Enter batter's last name..."
                />
              </div>

              <div className="batterName searchy">
                <div className="title spacer">Search Results:</div>
                <div className="dropdown">
                  {batterSug
                    .filter((item) => {
                      const searchTerm = batter.toLowerCase();
                      const fullName = item.Hitters.toLowerCase();

                      return (
                        searchTerm &&
                        fullName.includes(searchTerm) &&
                        fullName !== searchTerm
                      );
                    })
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        onClick={() => onSearch(item.Hitters)}
                        className="listItem"
                      >
                        {item.Hitters}
                      </div>
                    ))}
                </div>
              </div>
              <div className="batterName">
                <div className="title">Current H-AB: </div>
                <input
                  className="formInHAB"
                  type="number"
                  name="bHits"
                  id=" "
                  onChange={(e) => setHits(e.target.value)}
                  value={hits}
                  placeholder="0"
                />
                <input
                  className="formInHAB"
                  type="number"
                  name="bAB"
                  id=" "
                  onChange={(e) => setBats(e.target.value)}
                  value={bats}
                  placeholder="0"
                />
                <div className="title">Pitch Count: </div>
                <input
                  className="formInHAB"
                  type="number"
                  name="balls"
                  id=" "
                  onChange={(e) => setBalls(e.target.value)}
                  value={balls}
                  placeholder="0"
                />
                <input
                  className="formInHAB"
                  type="number"
                  name="strikes"
                  id=" "
                  onChange={(e) => setStrikes(e.target.value)}
                  value={strikes}
                  placeholder="0"
                />
              </div>

              <div className="buttons">
                <button className="submit" onClick={handleSubmit}>
                  Player Preview
                </button>
                <button className="submit live" onClick={handleBatterLive}>
                  Live Comments
                </button>
              </div>
            </form>

            <form method="post" className="pitcher">
              <div className="pitchRow batterUp">
                <div className="title spacer">Pitcher: </div>
                <input
                  className="formIn"
                  type="text"
                  autocomplete="off"
                  name="pitcher"
                  id=" "
                  onChange={handlePInputChange}
                  value={pitcher}
                  placeholder="Enter pitcher's last name..."
                />
              </div>
              <div className="pitchRow searchy">
                <div className="title spacer">Search Results:</div>
                <div className="dropdown">
                  {pitcherSug
                    .filter((item) => {
                      const searchTerm = pitcher.toLowerCase();
                      const fullName = item.Pitchers.toLowerCase();

                      return (
                        searchTerm &&
                        fullName.includes(searchTerm) &&
                        fullName !== searchTerm
                      );
                    })
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        onClick={() => onPSearch(item.Pitchers)}
                        className="listItem"
                      >
                        {item.Pitchers}
                      </div>
                    ))}
                </div>
              </div>
              <div className="pitchRow">
                <div className="title">Innings Pitched: </div>
                <input
                  className="formInHAB"
                  type="number"
                  name="innings"
                  id=" "
                  onChange={(e) => setInnings(e.target.value)}
                  value={innings}
                  placeholder="0"
                />
                <div className="title">Runs Earned: </div>
                <input
                  className="formInHAB"
                  type="number"
                  name="bAB"
                  id=" "
                  onChange={(e) => setRuns(e.target.value)}
                  value={runs}
                  placeholder="0"
                />
                <div className="title">Pitch Speed:</div>
                <input
                  className="formInSpeed"
                  type="number"
                  name="speed"
                  id=" "
                  onChange={(e) => setSpeed(e.target.value)}
                  value={speed}
                  placeholder="mph"
                />
              </div>

              <div className="buttons">
                <button className="submit" onClick={handlePitcherSubmit}>
                  Player Preview
                </button>
                <button
                  className="submit live"
                  onClick={handleLivePitcherSubmit}
                >
                  Live Comments
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="resultsFromSearchContainer">
          <div className="resultsTitle">Results</div>
          <div className="scrolls">
            <button onClick={() => scrollTo("BLC")}>Back to top</button>
            <button onClick={() => scrollTo("PLC")}>
              Pitcher Live Comments
            </button>
            <button onClick={() => scrollTo("BC")}>Batter Comments</button>
            <button onClick={() => scrollTo("PC")}>Pitcher Comments</button>
          </div>
          {result ? (
            <div className="resultsFromSearch">
              <ul>
                <div onClick={toggleLiveBatter} id={"BLC"} className="divide">
                  Batter Live Comments:
                </div>
                {showBatterLive &&
                  liveResult.map((messageLB, indexLB) => (
                    <li className="comment" key={indexLB}>
                      <img
                        src={pitcherIcon}
                        alt="player icon"
                        height={30}
                        width={30}
                      />
                      <div className="structure">
                        <div className="label">
                          <div className="upper">{messageLB.type}</div>
                          <div className="labName">{messageLB.name}</div>
                        </div>
                        <div>{messageLB.value}</div>
                      </div>
                      <button
                        className="clearCom"
                        onClick={() => clearLiveItem(indexLB)}
                      >
                        Clear
                      </button>
                    </li>
                  ))}
                <div onClick={toggleLivePitcher} id={"PLC"} className="divide">
                  Pitcher Live Comments:
                </div>
                {showPitcherLive &&
                  liveResultP.map((messageLP, indexLP) => (
                    <li className="comment pitchBlue" key={indexLP}>
                      <img
                        src={pitcherIcon}
                        alt="player icon"
                        height={30}
                        width={30}
                      />
                      <div className="structure">
                        <div className="label">
                          <div className="upper">{messageLP.type}</div>
                          <div className="labName">{messageLP.name}</div>
                        </div>
                        <div>{messageLP.value}</div>
                      </div>
                      <button
                        className="clearCom"
                        onClick={() => clearLiveItemP(indexLP)}
                      >
                        Clear
                      </button>
                    </li>
                  ))}
                <div onClick={toggleBatter} id={"BC"} className="divide">
                  Batter Comments:
                </div>
                {showBatter &&
                  result.map((message, index) => (
                    <li className="comment" key={index}>
                      <img
                        src={playerIcon}
                        alt="player icon"
                        height={30}
                        width={30}
                      />
                      <div className="structure">
                        <div className="label">
                          <div className="upper">{message.type}</div>
                          <div className="labName">{message.name}</div>
                        </div>
                        <div>{message.value}</div>
                      </div>
                      <button
                        className="clearCom"
                        onClick={() => clearItem(index)}
                      >
                        Clear
                      </button>
                    </li>
                  ))}
                <div onClick={togglePitcher} id={"PC"} className="divide">
                  Pitcher Comments:
                </div>
                {showPitcher &&
                  resultP.map((messageP, indexP) => (
                    <li className="comment pitchBlue" key={indexP}>
                      <img
                        src={pitcherIcon}
                        alt="player icon"
                        height={30}
                        width={30}
                      />
                      <div className="structure">
                        <div className="label">
                          <div className="upper">{messageP.type}</div>
                          <div className="labName">{messageP.name}</div>
                        </div>
                        <div>{messageP.value}</div>
                      </div>
                      <button
                        className="clearCom"
                        onClick={() => clearItemP(indexP)}
                      >
                        Clear
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p>Awaiting Input</p>
          )}
          <div className="clearButtonContainer">
            <button className="clearAll center" onClick={clearAllBatters}>
              <img src={playerIcon} alt="player icon" height={20} width={20} />
              Clear Batters
            </button>
            <button className="clearAll center" onClick={clearAllPitchers}>
              <img src={pitcherIcon} alt="player icon" height={20} width={20} />
              Clear Pitchers
            </button>
            <button className="clearAll" onClick={clearAllItems}>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputForm;
