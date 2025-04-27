"use client";
import { MouseEvent, RefObject, useEffect, useState } from "react";
import { generateClass } from "./selection-menu/selecton-menu-utils";

const useDrawRectangle = (divRef: RefObject<HTMLDivElement>, scale: number) => {
  useEffect(() => {
    const pdfsContainer = divRef.current as HTMLDivElement;
    if (!pdfsContainer) return;
    //const pdfPageContainerRect = pdfsContainer.getBoundingClientRect();

    let pdfPageContainer: HTMLDivElement;
    let pdfPageContainerRect: DOMRect;

    pdfsContainer.querySelectorAll("span").forEach((span) => {
      span.style.pointerEvents = "none";
    });

    const getMousePos = (event: MouseEvent | any) => {
      const { clientX, clientY } = event;

      //start the y axis of the mouse from pdf container top
      const mousePosX = Math.round(clientX - pdfPageContainerRect.left);
      //start the x axis of the mouse from pdf container left
      const mousePosY = Math.round(clientY - pdfPageContainerRect.top);

      return { mousePosX, mousePosY };
    };

    const handlePdfPageSelection = (event: MouseEvent | any) => {
      const { clientX, clientY } = event;
      pdfsContainer
        .querySelectorAll<HTMLDivElement>(".pdfContainer")!
        .forEach((pdfContainer, index) => {
          const pdfContainerRect = pdfContainer.getBoundingClientRect();
          if (
            clientX > pdfContainerRect.left &&
            clientX < pdfContainerRect.right &&
            clientY > pdfContainerRect.top &&
            clientY < pdfContainerRect.bottom
          ) {
            console.log({ index: index + 1 });
            pdfPageContainer = pdfContainer;
            pdfPageContainerRect = pdfContainerRect;
          }
        });
    };

    let isMouseDown = false;
    let isMouseExpandingRight = false;
    let isMouseExpandingLeft = false;
    let isMouseExpandingBottom = false;
    let isMouseExpandingTop = false;

    let startMouseX = 0;
    let startMouseY = 0;

    let selectionBox: HTMLDivElement | undefined;
    let selectionBoxToExpand: HTMLDivElement;

    const selectionBoxStartingSize = 0;
    const extraSize = 0;

    const resetExpansionState = () => {
      isMouseExpandingRight = false;
      isMouseExpandingLeft = false;
      isMouseExpandingTop = false;
      isMouseExpandingBottom = false;
    };

    const createSelectionBox = () => {
      const newSelectionBox = document.createElement("div");
      newSelectionBox.style.zIndex = 100 + "";
      newSelectionBox.style.width = selectionBoxStartingSize + "px";
      newSelectionBox.style.height = selectionBoxStartingSize + "px";
      newSelectionBox.classList.add("selectionBox");
      newSelectionBox.id = generateClass("selectionBox");

      let isMouseDownOnSelectionBox = false;

      let dragStartX: number;
      let dragStartY: number;
      newSelectionBox.onmousedown = (event) => {
        event.stopImmediatePropagation();
        handlePdfPageSelection(event);
        //Set this selection box as the active
        pdfsContainer
          .querySelectorAll(".selectionBox")
          .forEach((selectionBox) => {
            selectionBox.querySelectorAll("span").forEach((span) => {
              span.style.display = "none";
            });
          });

        newSelectionBox.querySelectorAll("span").forEach((span) => {
          span.style.display = "initial";
        });

        isMouseDownOnSelectionBox = true;
        const { mousePosX, mousePosY } = getMousePos(event);
        const newSelectionBoxRect = newSelectionBox.getBoundingClientRect();

        //The left of pos of selectionBox starting  from the left of pdfsContainer
        const left = newSelectionBoxRect.left - pdfPageContainerRect.left;
        //The top of pos of selectionBox starting  from the top of pdfsContainer
        const top = newSelectionBoxRect.top - pdfPageContainerRect.top;

        //Where we would start dragging this selection box from , this would be base on where mouse down event starts in the selection box
        dragStartX = mousePosX - left;
        dragStartY = mousePosY - top;

        newSelectionBox.style.left = mousePosX - dragStartX + "px";
        newSelectionBox.style.top = mousePosY - dragStartY + "px";
      };

      newSelectionBox.onmousemove = (event) => {
        if (!isMouseDownOnSelectionBox) return;
        const { mousePosX, mousePosY } = getMousePos(event);

        const left = mousePosX - dragStartX;
        const top = mousePosY - dragStartY;

        const newSelectionBoxRect = newSelectionBox.getBoundingClientRect();

        //To prevent dragging out of pdf container horizontally
        if (
          left >= 0 &&
          left + pdfPageContainerRect.left + newSelectionBoxRect.width <=
            pdfPageContainerRect.right
        ) {
          newSelectionBox.style.left = left + "px";
        }

        //To prevent dragging out of pdf container vertically
        if (
          top >= 0 &&
          top + pdfPageContainerRect.top + newSelectionBoxRect.height <=
            pdfPageContainerRect.bottom //  pdfPageContainerRect.height / 18 + pdfPageContainerRect.top - 3
        ) {
          newSelectionBox.style.top = top + "px";
        }
      };

      const handleMouseLeave = (event: MouseEvent | any) => {
        event.stopPropagation();
        isMouseDownOnSelectionBox = false;
        resetExpansionState();
      };

      newSelectionBox.onmouseup = handleMouseLeave;
      newSelectionBox.onmouseout = handleMouseLeave;

      const innerNewSelectionBox = document.createElement("div");
      innerNewSelectionBox.style.position = "relative";
      innerNewSelectionBox.style.width = "100%";
      innerNewSelectionBox.style.height = "100%";
      innerNewSelectionBox.classList.add("innernewSelectionBox");
      newSelectionBox.appendChild(innerNewSelectionBox);

      const size = 30;
      const getSelectionBoxCircle = (circleClass: string) => {
        const selectionBoxCircle = document.createElement("span");

        selectionBoxCircle.style.height = size + "px";
        selectionBoxCircle.style.width = size + "px";
        selectionBoxCircle.style.borderRadius = "50%";
        selectionBoxCircle.style.backgroundColor = "red";
        selectionBoxCircle.style.position = "absolute";
        selectionBoxCircle.style.cursor = "col-resize";
        selectionBoxCircle.style.display = "none";
        selectionBoxCircle.classList.add(circleClass);

        return selectionBoxCircle;
      };

      //Right Circle
      const selectionBoxToRightCircle = getSelectionBoxCircle("rightCircle");
      selectionBoxToRightCircle.style.right = -(size / 2) + "px";
      selectionBoxToRightCircle.style.top = "50%";
      selectionBoxToRightCircle.style.transform = "translateY(-50%)";

      selectionBoxToRightCircle.onmousedown = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingRight = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      selectionBoxToRightCircle.onmouseup = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingRight = false;
      };

      //Left Circle
      const selectionBoxToLeftCircle = getSelectionBoxCircle("leftCircle");
      selectionBoxToLeftCircle.style.left = -(size / 2) + "px";
      selectionBoxToLeftCircle.style.top = "50%";
      selectionBoxToLeftCircle.style.transform = "translateY(-50%)";

      selectionBoxToLeftCircle.onmousedown = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingLeft = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      selectionBoxToLeftCircle.onmouseup = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingLeft = false;
      };

      //Top Circle
      const selectionBoxToTopCircle = getSelectionBoxCircle("topCircle");
      selectionBoxToTopCircle.style.top = -(size / 2) + "px";
      selectionBoxToTopCircle.style.left = "50%";
      selectionBoxToTopCircle.style.transform = "translateX(-50%)";

      selectionBoxToTopCircle.onmousedown = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingTop = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      selectionBoxToTopCircle.onmouseup = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingTop = false;
      };

      //Bottom Circle
      const selectionBoxToBottomCircle = getSelectionBoxCircle("bottomCircle");
      selectionBoxToBottomCircle.style.bottom = -(size / 2) + "px";
      selectionBoxToBottomCircle.style.left = "50%";
      selectionBoxToBottomCircle.style.transform = "translateX(-50%)";

      selectionBoxToBottomCircle.onmousedown = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingBottom = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      selectionBoxToBottomCircle.onmouseup = (event) => {
        event.stopImmediatePropagation();
        isMouseExpandingBottom = false;
      };

      innerNewSelectionBox.appendChild(selectionBoxToRightCircle);
      innerNewSelectionBox.appendChild(selectionBoxToLeftCircle);
      innerNewSelectionBox.appendChild(selectionBoxToTopCircle);
      innerNewSelectionBox.appendChild(selectionBoxToBottomCircle);

      return newSelectionBox;
    };

    const fixHorizontalExpansionBreaking = (mousePosY: number) => {
      const selectionBoxToRightCircleRect = selectionBoxToExpand
        .querySelector(".rightCircle")!
        .getBoundingClientRect();

      //The top and bottom of the circle expanding selection box width
      const top = selectionBoxToRightCircleRect.top - pdfPageContainerRect.top;
      const bottom = top + selectionBoxToRightCircleRect.height;

      //Is the mouse position greater than the top or the mouse position less than the bottom of the circle expanding selection box
      const isCursorNotVerticallyIn =
        top - extraSize > mousePosY || bottom + extraSize < mousePosY;

      if (isCursorNotVerticallyIn) isMouseExpandingRight = false;
    };

    const expandSelectionBoxToRight = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Get left of selection box starting from pdf container
      const left = selectionBoxToExpandRect.left - pdfPageContainerRect.left;

      //Getting how far mouse is moving to right, away from selection box
      const deltaX = mousePosX - (left + selectionBoxToExpandRect.width);
      //The current width of the selection box plus how far the mouse is moving to right, away from selection box
      const width = selectionBoxToExpandRect.width + deltaX;

      // Is the position of mouse out of the pdf container greater than the right position of the pdf container
      const isExpandingPassContainerRight =
        mousePosX + pdfPageContainerRect.left > pdfPageContainerRect.right;

      if (!isExpandingPassContainerRight) {
        selectionBoxToExpand.style.width = width + "px";
      }

      fixHorizontalExpansionBreaking(mousePosY);
    };

    const expandSelectionBoxToLeft = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Get left of selection box starting from pdf container
      const left = selectionBoxToExpandRect.left - pdfPageContainerRect.left;

      //Getting how far mouse is moving to left from selection box
      const deltaX = left - mousePosX;
      //The current width of the selection box plus how far the mouse is moving to left, away from selection box
      const width = selectionBoxToExpandRect.width + deltaX;

      const isExpandingPassContainerRight = mousePosX < 0;

      if (!isExpandingPassContainerRight) {
        selectionBoxToExpand.style.width = width + "px";
        selectionBoxToExpand.style.left = mousePosX + "px";
      }

      fixHorizontalExpansionBreaking(mousePosY);
    };

    const fixVerticalExpansionBreaking = (mousePosX: number) => {
      const selectionBoxToRightCircleRect = selectionBoxToExpand
        .querySelector(".topCircle")!
        .getBoundingClientRect();

      const left =
        selectionBoxToRightCircleRect.left - pdfPageContainerRect.left;
      const right = left + selectionBoxToRightCircleRect.width;

      const isCursorNotVerticallyIn =
        left - extraSize > mousePosX || right + extraSize < mousePosX;

      if (isCursorNotVerticallyIn) isMouseExpandingTop = false;
    };

    const expandSelectionBoxToTop = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Getting the top of selection box in pdf container
      const top = selectionBoxToExpandRect.top - pdfPageContainerRect.top;
      console.log(pdfPageContainerRect);

      //Getting how far mouse is moving away from the top of selection box
      const deltaY = top - mousePosY;
      //The current height of the selection box plus how far the mouse is moving to top, away from selection box
      const height = selectionBoxToExpandRect.height + deltaY;

      //Is mouse expand the top of selection box out of pdf container
      const isExpandingPassContainerTop = mousePosY < 0;
      if (!isExpandingPassContainerTop) {
        selectionBoxToExpand.style.height = height + "px";
        selectionBoxToExpand.style.top = mousePosY + "px";
      }
      fixVerticalExpansionBreaking(mousePosX);
    };

    const expandSelectionBoxToBottom = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Getting the top of selection box in pdf container
      const top = selectionBoxToExpandRect.top - pdfPageContainerRect.top;
      //Getting how far mouse is moving to bottom , away from selection box
      const deltaY = mousePosY - (top + selectionBoxToExpandRect.height);
      //The current height of the selection box plus how far the mouse is moving to bottom, away from selection box
      const height = selectionBoxToExpandRect.height + deltaY;

      //TODO
      const bottom = pdfPageContainerRect.bottom;
      // pdfPageContainerRect.height / 18 + pdfPageContainerRect.top;
      //TODO:
      const isExpandingPassContainerBottom =
        mousePosY + pdfPageContainerRect.top > bottom;

      if (!isExpandingPassContainerBottom) {
        selectionBoxToExpand.style.height = height + "px";
      }

      fixVerticalExpansionBreaking(mousePosX);
    };

    const resizeNewSelectionBox = (event: MouseEvent | any) => {
      if (!isMouseDown || !selectionBox) return;

      const { mousePosX, mousePosY } = getMousePos(event);

      const deltaX = mousePosX - startMouseX;
      const deltaY = mousePosY - startMouseY;

      // Width and left
      if (deltaX >= 0) {
        // Dragging right
        selectionBox.style.left = `${startMouseX}px`;
        selectionBox.style.width = `${deltaX}px`;
      } else {
        // Dragging left
        selectionBox.style.left = `${mousePosX}px`;
        selectionBox.style.width = `${-deltaX}px`;
      }

      // Height and top
      if (deltaY >= 0) {
        selectionBox.style.top = `${startMouseY}px`;
        selectionBox.style.height = `${deltaY}px`;
      } else {
        selectionBox.style.top = `${mousePosY}px`;
        selectionBox.style.height = `${-deltaY}px`;
      }
    };

    const handleMouseDown = (event: MouseEvent | any) => {
      isMouseDown = true;

      handlePdfPageSelection(event);

      if (isMouseExpandingRight) return;

      const { mousePosX, mousePosY } = getMousePos(event);
      selectionBox = createSelectionBox();
      selectionBox.style.position = "absolute";
      selectionBox.style.pointerEvents = "none";
      selectionBox.style.backgroundColor = "rgba(0,255,0,0.3)";
      selectionBox.style.border = "2px solid green";

      startMouseX = mousePosX - selectionBoxStartingSize;
      startMouseY = mousePosY - selectionBoxStartingSize;

      selectionBox.style.left = startMouseX + "px";
      selectionBox.style.top = startMouseY + "px";

      pdfsContainer.style.userSelect = "none";
      pdfPageContainer.appendChild(selectionBox);
    };

    const handleMouseMove = (event: MouseEvent | any) => {
      if (isMouseDown) {
        resizeNewSelectionBox(event);
      } else {
        if (isMouseExpandingRight) {
          expandSelectionBoxToRight(event);
        }

        if (isMouseExpandingLeft) {
          expandSelectionBoxToLeft(event);
        }

        if (isMouseExpandingTop) {
          expandSelectionBoxToTop(event);
        }

        if (isMouseExpandingBottom) {
          expandSelectionBoxToBottom(event);
        }
      }
    };

    const handleMouseLeave = () => {
      isMouseDown = false;

      if (!selectionBox) return;

      //Make other selection box no active
      pdfsContainer
        .querySelectorAll(".selectionBox")
        .forEach((selectionBox) => {
          selectionBox.querySelectorAll("span").forEach((span) => {
            span.style.display = "none";
          });
        });

      //Make the new selection box to be active
      selectionBox.style.pointerEvents = "auto";
      selectionBox.style.cursor = "move";
      selectionBox.querySelectorAll("span").forEach((span) => {
        span.style.display = "initial";
      });

      selectionBox = undefined;
    };

    const handleMouseUp = () => {
      resetExpansionState();
      handleMouseLeave();
    };

    const handleMouseOut = () => {
      handleMouseLeave();
    };

    pdfsContainer.addEventListener("mousedown", handleMouseDown);
    pdfsContainer.addEventListener("mousemove", handleMouseMove);
    pdfsContainer.addEventListener("mouseup", handleMouseUp);
    pdfsContainer.addEventListener("mouseout", handleMouseOut);

    return () => {
      pdfsContainer.removeEventListener("mousedown", handleMouseDown);
      pdfsContainer.removeEventListener("mousemove", handleMouseMove);
      pdfsContainer.removeEventListener("mouseup", handleMouseUp);
      pdfsContainer.removeEventListener("mouseout", handleMouseOut);
    };
  }, [divRef.current, scale]);
};

export default useDrawRectangle;
