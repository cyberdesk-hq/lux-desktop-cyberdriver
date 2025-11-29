import React, { useEffect, useState } from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  Modifier,
  SelectionState,
  getDefaultKeyBinding,
  convertToRaw,
  DraftDecoratorComponentProps,
  ContentState,
} from 'draft-js';
import { AutomationStatus, Mode } from '../../common';
import { MODE_PLACEHOLDER, workflows } from '../utils';
import Dropdown from './Dropdown';
import SendIcon from './SendIcon';
import StopIcon from './StopIcon';
import WorkflowLabel from './WorkflowLabel';
import styles from './InstructionEditor.module.less';
import type { Workflow } from '../utils';

const decorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback, contentState) =>
      contentBlock.findEntityRanges(character => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'MENTION'
        );
      }, callback),
    component: ({ contentState, entityKey }: DraftDecoratorComponentProps) => (
      <WorkflowLabel workflow={contentState.getEntity(entityKey!).getData()} />
    ),
  },
]);

export interface InstructionEditorProps {
  mode: Mode;
  loading: boolean;
  status?: AutomationStatus;
  startAutomation: (instruction: string) => Promise<void>;
  stopAutomation: () => Promise<void>;
}

const InstructionEditor: React.FC<InstructionEditorProps> = ({
  mode,
  loading,
  status,
  startAutomation,
  stopAutomation,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(decorator),
  );
  const [runningTaskState, setRunningTaskState] = useState<EditorState>();
  const [instruction, setInstruction] = useState('');
  const [focused, setFocused] = useState(false);
  const open = focused && mode === Mode.Tasker;
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const isRunning = status === 'Running';

  useEffect(() => {
    setEditorState(EditorState.createEmpty(decorator));
    setInstruction('');
    setFocused(false);
  }, [mode]);

  useEffect(() => {
    if (
      status === AutomationStatus.Cancelled ||
      status === AutomationStatus.Error
    ) {
      setEditorState(runningTaskState!);
      setInstruction(
        convertToRaw(runningTaskState!.getCurrentContent()).blocks[0].text,
      );
    }
  }, [status]);

  const onEditorChange = (state: EditorState) => {
    const instruction = convertToRaw(state.getCurrentContent()).blocks[0].text;
    if (mode !== Mode.Tasker || instruction === '') {
      setEditorState(state);
      setInstruction(instruction);
      return;
    }
  };

  const insertWorkflow = (workflow: Workflow) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const offset = selection.getAnchorOffset();

    const end = offset;
    const newSelection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: 0,
      focusOffset: end,
    });

    const contentStateWithEntity = contentState.createEntity(
      'MENTION',
      'IMMUTABLE',
      workflow,
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    let newContentState = Modifier.replaceText(
      contentStateWithEntity,
      newSelection,
      `/${workflow.key}`,
      undefined,
      entityKey,
    );
    newContentState = Modifier.insertText(
      newContentState,
      newContentState.getSelectionAfter(),
      ' ',
    );

    setEditorState(
      EditorState.forceSelection(
        EditorState.push(editorState, newContentState, 'insert-characters'),
        newContentState.getSelectionAfter(),
      ),
    );
    setInstruction(`/${workflow.key}`);
  };

  const handleStart = async () => {
    setRunningTaskState(editorState);
    onEditorChange(EditorState.createEmpty(decorator));
    await startAutomation(instruction);
  };
  const handleKeyCommand = (command: string): 'handled' | 'not-handled' => {
    if (open) {
      switch (command) {
        case 'up':
          setSuggestionIndex(
            i => (i - 1 + workflows.length) % workflows.length,
          );
          return 'handled';
        case 'down':
          setSuggestionIndex(i => (i + 1) % workflows.length);
          return 'handled';
        case 'enter':
          if (workflows[suggestionIndex]) {
            insertWorkflow(workflows[suggestionIndex]);
            return 'handled';
          }
      }
    } else {
      if (command === 'enter') {
        handleStart();
        return 'handled';
      }
    }
    return 'not-handled';
  };

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <div className="flex min-h-[56px] flex-col gap-2 rounded-chat bg-accent-b p-2">
        {/* Typing Area */}
        <Dropdown
          open={open}
          setOpen={setFocused}
          options={workflows.map(workflow => ({
            key: workflow.key,
            label: workflow.command,
            selected: instruction === `/${workflow.key}`,
            onClick: () => insertWorkflow(workflow),
          }))}
          position="top-right"
          className="relative min-h-[15px] resize-none bg-transparent px-0.5 text-sm-chat text-accent-c placeholder-accent-b-1 outline-none"
        >
          <div
            className={styles.editor}
            onClick={() => mode === Mode.Tasker && setFocused(true)}
          >
            <Editor
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              readOnly={loading || isRunning || (mode === Mode.Tasker && !!instruction)}
              editorState={editorState}
              onChange={onEditorChange}
              handleKeyCommand={handleKeyCommand}
              handlePastedText={(text, _, editorState) => {
                const contentState = EditorState.push(
                  editorState,
                  ContentState.createFromText(text),
                  'insert-characters',
                );
                setEditorState(contentState);
                return 'handled';
              }}
              keyBindingFn={e => {
                if (focused) {
                  switch (e.key) {
                    case 'ArrowDown':
                      return 'down';
                    case 'ArrowUp':
                      return 'up';
                    case 'Enter':
                      return 'enter';
                  }
                } else {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    return 'enter';
                  }
                }
                return getDefaultKeyBinding(e);
              }}
              placeholder={MODE_PLACEHOLDER[mode]}
            />
          </div>
        </Dropdown>

        {/* Message Trigger */}
        <div className="flex h-[30px] items-center justify-end">
          {isRunning ? (
            <button onClick={stopAutomation}>
              <StopIcon />
            </button>
          ) : (
            <button
              disabled={loading || !instruction.trim()}
              onClick={handleStart}
            >
              <SendIcon disabled={loading || !instruction.trim()} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionEditor;
