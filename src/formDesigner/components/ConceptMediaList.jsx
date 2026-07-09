import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, IconButton, Chip, Stack, Typography } from "@mui/material";
import { DragHandle, Delete } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { MediaPreview } from "../../common/components/AvniMediaUpload";
import MediaService from "../../adminApp/service/MediaService";
import WebConcept from "../../common/model/WebConcept";

export default function ConceptMediaList({ media = [], onChange }) {
  const [signedUrls, setSignedUrls] = useState({});

  const savedKeys = useMemo(
    () => media.filter((m) => m.url).map((m) => m.url),
    [media],
  );

  useEffect(() => {
    const keysToResolve = savedKeys.filter((key) => !signedUrls[key]);
    if (isEmpty(keysToResolve)) return;
    let cancelled = false;
    Promise.all(keysToResolve.map((key) => MediaService.getMedia(key))).then(
      (resolved) => {
        if (cancelled) return;
        setSignedUrls((prev) => {
          const next = { ...prev };
          keysToResolve.forEach((key, i) => {
            next[key] = resolved[i];
          });
          return next;
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [savedKeys, signedUrls]);

  const displayUrlFor = (item) => {
    if (item.file && !item.url) return URL.createObjectURL(item.file);
    return signedUrls[item.url];
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    onChange(
      WebConcept.moveMedia(
        media,
        result.source.index,
        result.destination.index,
      ),
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="concept-media">
        {(provided) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={1}
            sx={{ maxHeight: 420, overflowY: "auto", pr: 1 }}
          >
            {media.map((item, index) => {
              const draggableId = String(item.localKey || item.url || index);
              const displayUrl = displayUrlFor(item);
              return (
                <Draggable
                  key={draggableId}
                  draggableId={draggableId}
                  index={index}
                >
                  {(dp) => (
                    <Box
                      ref={dp.innerRef}
                      {...dp.draggableProps}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                      }}
                    >
                      <span {...dp.dragHandleProps} style={{ display: "flex" }}>
                        <DragHandle />
                      </span>
                      <Chip size="small" label={item.type} />
                      {displayUrl ? (
                        <MediaPreview
                          mediaUrl={displayUrl}
                          mediaType={item.type}
                          width={60}
                          height={60}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>
                          Loading preview...
                        </Typography>
                      )}
                      <IconButton
                        aria-label="delete-media"
                        onClick={() =>
                          onChange(WebConcept.removeMediaAt(media, index))
                        }
                        sx={{ ml: "auto" }}
                      >
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </Box>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}
