"use client";

import React, { RefObject, useEffect, useState } from "react";
import { get_tweet_card } from "@/lib/get_tweet_card.js";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";

interface CanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}
interface CanvasSize {
  width: number;
  height: number;
}
const isCanvasSize = (obj: any): obj is CanvasSize => {
  return typeof obj.width === "number" && typeof obj.height === "number";
};
const text = "Add any text you want and create images. ";
const Canvas: React.FC<CanvasProps> = ({ canvasRef }) => {
  const [inputContent, setInputContent] = useState(text);
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 427 });
  const [initValues, setInitValues] = useState({
    size: "M",
    logo: "AppLogo",
    appLogo: "AppLogo",
    name: "Dear Bob",
    userId: "@user_id",
    bgColors: ["#ffafbd", "#ffc3a0"],
    fontSizeRadio: 40,
    cardBgColor: "rgba(255, 255, 255, .8)",
    contentColor: "#333336",
    nameColor: "#333336",
    userIdColor: "#333336",
    timeColor: "rgba(0, 0, 0, .5)",
  });
  const [writeToClipboard, setWriteToClipboard] = useState(false);
  const [downloadToDisk, setDownloadToDisk] = useState(false);
  const updateCanvasSize = (variable: CanvasSize) => {
    const { width, height }: CanvasSize = variable;
    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    const generateCanvas = async () => {
      if (canvasRef.current) {
        const mergedValues = {
          ...initValues,
          writeToClipboard,
          downloadToDisk,
        };
        console.log(mergedValues);
        const result = await get_tweet_card(
          inputContent,
          mergedValues,
          canvasRef.current
        );
        setWriteToClipboard(false);
        setDownloadToDisk(false);
        if (!result) return;
        if (isCanvasSize(result)) {
          updateCanvasSize(result);
        } else {
          console.error("The result is not a valid CanvasSize.");
        }
      }
    };

    generateCanvas(); // Call the function when the component mounts

    // Clean-up function can be added here if needed
  }, [canvasRef, inputContent, initValues, writeToClipboard, downloadToDisk]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
  };

  const handleSizeChange = () => {
    if (initValues.size === "S") {
      setInitValues({
        ...initValues,
        size: "M",
      });
    } else if (initValues.size === "M") {
      setInitValues({
        ...initValues,
        size: "L",
      });
    } else if (initValues.size === "L") {
      setInitValues({
        ...initValues,
        size: "S",
      });
    }
  };

  const handleBgColorsChange = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    const randomColor2 =
      "#" + Math.floor(Math.random() * 16777215).toString(16);
    setInitValues({
      ...initValues,
      bgColors: [randomColor, randomColor2],
    });
  };

  const handleCardBgColorChange = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setInitValues({
      ...initValues,
      cardBgColor: randomColor,
    });
  };

  const handleFontSize = () => {
    if (initValues.fontSizeRadio === 20) {
      setInitValues({
        ...initValues,
        fontSizeRadio: 30,
      });
    } else if (initValues.fontSizeRadio === 30) {
      setInitValues({
        ...initValues,
        fontSizeRadio: 40,
      });
    } else if (initValues.fontSizeRadio === 40) {
      setInitValues({
        ...initValues,
        fontSizeRadio: 20,
      });
    }
  };
  const handleNameColorChange = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setInitValues({
      ...initValues,
      nameColor: randomColor,
    });
  };

  const handleUserIdColorChange = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setInitValues({
      ...initValues,
      userIdColor: randomColor,
    });
  };

  const handleTimeColorChange = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setInitValues({
      ...initValues,
      timeColor: randomColor,
    });
  };
  const handleWriteToClipboardChange = () => {
    setWriteToClipboard(true);
  };

  const handleDownloadToDiskChange = () => {
    setDownloadToDisk(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitValues({
      ...initValues,
      name: e.target.value,
    });
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitValues({
      ...initValues,
      userId: e.target.value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event.target) {
          const logoDataUrl = event.target.result as string;
          setInitValues({
            ...initValues,
            logo: logoDataUrl,
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAppLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event.target) {
          const logoDataUrl = event.target.result as string;
          setInitValues({ ...initValues, appLogo: logoDataUrl });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const renderOptions = () => {
    return (
      <div className="sticky top-0 flex flex-col items-start lg:items-center lg:min-h-screen lg:justify-start">
        <div className="block m-auto rounded-lg">
          <Textarea
            minLength={1}
            maxLength={1000}
            value={inputContent}
            onChange={handleInputChange}
          />
          <Input
            maxLength={40}
            id="nameInput"
            type="text"
            value={initValues.name}
            onChange={handleNameChange}
            placeholder="Name:"
          />
          <Input
            maxLength={40}
            id="userIdInput"
            type="text"
            value={initValues.userId}
            onChange={handleUserIdChange}
            placeholder="User ID:"
          />

          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleBgColorsChange}
          >
            Randomize Background Colors
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleCardBgColorChange}
          >
            Randomize Card Background Color
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleNameColorChange}
          >
            Randomize Name Color
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleUserIdColorChange}
          >
            Randomize UserID Color
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleTimeColorChange}
          >
            Randomize Time Color
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleFontSize}
          >
            Randomize FontSize
          </Button>

          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleSizeChange}
          >
            Randomize ImageSize
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleWriteToClipboardChange}
          >
            Toggle Write to Clipboard
          </Button>
          <Button
            className="w-full lg:w-[350px]"
            variant="secondary"
            onClick={handleDownloadToDiskChange}
          >
            Toggle Download to Disk
          </Button>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Avatar</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">AppLogo</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleAppLogoUpload}
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col items-start justify-start h-screen px-5 lg:px-10 min-h-[800px]">
      <div className="relative flex flex-col-reverse w-full lg:flex-row-reverse max-w-[1600px] mx-auto">
        <div className="w-full lg:w-[350px]">{renderOptions()}</div>
        <div className="w-full lg:w-[calc(100%-350px)] py-5 lg:p-10 lg:pl-0 flex flex-col-reverse lg:flex-col items-center justify-center overflow-y-auto">
          <canvas
            ref={canvasRef}
            style={{
              width: `${canvasSize.width}`,
              height: `${canvasSize.height}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
