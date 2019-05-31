var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import Autosuggest from 'react-autosuggest';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles, createStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import blue from '@material-ui/core/colors/blue';
import compose from 'recompose/compose';
import classNames from 'classnames';
import { addField, translate, FieldTitle } from 'ra-core';
import AutocompleteArrayInputChip from './AutocompleteArrayInputChip';
var styles = function (theme) { return createStyles({
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    root: {},
    suggestionsContainerOpen: {
        position: 'absolute',
        marginBottom: theme.spacing.unit * 3,
        zIndex: 2,
    },
    suggestionsPaper: {
        maxHeight: '50vh',
        overflowY: 'auto',
    },
    suggestion: {
        display: 'block',
        fontFamily: theme.typography.fontFamily,
    },
    suggestionText: { fontWeight: 300 },
    highlightedSuggestionText: { fontWeight: 500 },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },
    chip: {
        marginRight: theme.spacing.unit,
        marginTop: theme.spacing.unit,
    },
    chipDisabled: {
        pointerEvents: 'none',
    },
    chipFocused: {
        backgroundColor: blue[300],
    },
}); };
/**
 * An Input component for an autocomplete field, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *    { id: 'M', name: 'Male' },
 *    { id: 'F', name: 'Female' },
 * ];
 * <AutocompleteInput source="gender" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
 *    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
 * ];
 * <AutocompleteInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <AutocompleteInput source="author_id" choices={choices} optionText={optionRenderer} />
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'M', name: 'myroot.gender.male' },
 *    { id: 'F', name: 'myroot.gender.female' },
 * ];
 *
 * However, in some cases (e.g. inside a `<ReferenceInput>`), you may not want
 * the choice to be translated. In that case, set the `translateChoice` prop to false.
 * @example
 * <AutocompleteInput source="gender" choices={choices} translateChoice={false}/>
 *
 * The object passed as `options` props is passed to the material-ui <AutoComplete> component
 *
 * @example
 * <AutocompleteInput source="author_id" options={{ fullWidth: true }} />
 */
var AutocompleteArrayInput = /** @class */ (function (_super) {
    __extends(AutocompleteArrayInput, _super);
    function AutocompleteArrayInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialInputValue = [];
        _this.state = {
            dirty: false,
            inputValue: _this.initialInputValue,
            searchText: '',
            suggestions: [],
        };
        _this.inputEl = null;
        _this.anchorEl = null;
        _this.getInputValue = function (inputValue) {
            return inputValue === '' ? _this.initialInputValue : inputValue;
        };
        _this.getSuggestionValue = function (suggestion) { return get(suggestion, _this.props.optionValue); };
        _this.getSuggestionText = function (suggestion) {
            if (!suggestion)
                return '';
            var _a = _this.props, optionText = _a.optionText, translate = _a.translate, translateChoice = _a.translateChoice;
            var suggestionLabel = typeof optionText === 'function'
                ? optionText(suggestion)
                : get(suggestion, optionText);
            // We explicitly call toString here because AutoSuggest expect a string
            return translateChoice
                ? translate(suggestionLabel, { _: suggestionLabel }).toString()
                : suggestionLabel.toString();
        };
        _this.handleSuggestionSelected = function (event, _a) {
            var suggestion = _a.suggestion, method = _a.method;
            var input = _this.props.input;
            input.onChange((_this.state.inputValue || []).concat([
                _this.getSuggestionValue(suggestion),
            ]));
            if (method === 'enter') {
                event.preventDefault();
            }
        };
        _this.handleSuggestionsFetchRequested = function () {
            var _a = _this.props, choices = _a.choices, inputValueMatcher = _a.inputValueMatcher;
            _this.setState(function (_a) {
                var searchText = _a.searchText;
                return ({
                    suggestions: choices.filter(function (suggestion) {
                        return inputValueMatcher(searchText, suggestion, _this.getSuggestionText);
                    }),
                });
            });
        };
        _this.handleSuggestionsClearRequested = function () {
            _this.updateFilter('');
        };
        _this.handleMatchSuggestionOrFilter = function (inputValue) {
            _this.setState({
                dirty: true,
                searchText: inputValue,
            });
            _this.updateFilter(inputValue);
        };
        _this.handleChange = function (event, _a) {
            var newValue = _a.newValue, method = _a.method;
            switch (method) {
                case 'type':
                case 'escape':
                {
                    _this.handleMatchSuggestionOrFilter(newValue);
                }
                    break;
            }
        };
        _this.renderInput = function (inputProps) {
            var input = _this.props.input;
            var autoFocus = inputProps.autoFocus, className = inputProps.className, classes = inputProps.classes, isRequired = inputProps.isRequired, label = inputProps.label, meta = inputProps.meta, onChange = inputProps.onChange, resource = inputProps.resource, source = inputProps.source, value = inputProps.value, ref = inputProps.ref, _a = inputProps.options, InputProps = _a.InputProps, suggestionsContainerProps = _a.suggestionsContainerProps, options = __rest(_a, ["InputProps", "suggestionsContainerProps"]), other = __rest(inputProps, ["autoFocus", "className", "classes", "isRequired", "label", "meta", "onChange", "resource", "source", "value", "ref", "options"]);
            if (typeof meta === 'undefined') {
                throw new Error("The TextInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details.");
            }
            var touched = meta.touched, error = meta.error, _b = meta.helperText, helperText = _b === void 0 ? false : _b;
            // We need to store the input reference for our Popper element containg the suggestions
            // but Autosuggest also needs this reference (it provides the ref prop)
            var storeInputRef = function (input) {
                _this.inputEl = input;
                _this.updateAnchorEl();
                ref(input);
            };
            return (React.createElement(AutocompleteArrayInputChip, __assign({ clearInputValueOnChange: true, onUpdateInput: onChange, onAdd: _this.handleAdd, onDelete: _this.handleDelete, value: _this.getInputValue(input.value), inputRef: storeInputRef, error: !!(touched && error), helperText: (touched && error) || helperText, chipRenderer: _this.renderChip, label: React.createElement(FieldTitle, { label: label, source: source, resource: resource, isRequired: isRequired }) }, other, options)));
        };
        _this.renderChip = function (_a, key) {
            var value = _a.value, isFocused = _a.isFocused, isDisabled = _a.isDisabled, handleClick = _a.handleClick, handleDelete = _a.handleDelete;
            var _b;
            var _c = _this.props, _d = _c.classes, classes = _d === void 0 ? {} : _d, choices = _c.choices;
            var suggestion = choices.find(function (choice) { return _this.getSuggestionValue(choice) === value; });
            return (React.createElement(Chip, { key: key, className: classNames(classes.chip, (_b = {},
                    _b[classes.chipDisabled] = isDisabled,
                    _b[classes.chipFocused] = isFocused,
                    _b)), onClick: handleClick, onDelete: handleDelete, label: _this.getSuggestionText(suggestion) }));
        };
        _this.handleAdd = function (chip) {
            var _a = _this.props, choices = _a.choices, input = _a.input, limitChoicesToValue = _a.limitChoicesToValue, inputValueMatcher = _a.inputValueMatcher;
            var filteredChoices = choices.filter(function (choice) {
                return inputValueMatcher(chip, choice, _this.getSuggestionText);
            });
            var choice = filteredChoices.length === 1
                ? filteredChoices[0]
                : filteredChoices.find(function (c) { return _this.getSuggestionValue(c) === chip; });
            if (choice) {
                return input.onChange((_this.state.inputValue || []).concat([
                    _this.getSuggestionValue(choice),
                ]));
            }
            if (limitChoicesToValue) {
                // Ensure to reset the filter
                _this.updateFilter('');
                return;
            }
            input.onChange(_this.state.inputValue.concat([chip]));
        };
        _this.handleDelete = function (chip) {
            var input = _this.props.input;
            input.onChange(_this.state.inputValue.filter(function (value) { return value !== chip; }));
        };
        _this.renderSuggestionsContainer = function (autosuggestOptions) {
            var _a = autosuggestOptions.containerProps, className = _a.className, containerProps = __rest(_a, ["className"]), children = autosuggestOptions.children;
            var _b = _this.props, _c = _b.classes, classes = _c === void 0 ? {} : _c, options = _b.options;
            // Force the Popper component to reposition the popup only when this.inputEl is moved to another location
            _this.updateAnchorEl();
            return (React.createElement(Popper, __assign({ className: className, open: Boolean(children), anchorEl: _this.anchorEl, placement: "bottom-start" }, options.suggestionsContainerProps),
                React.createElement(Paper, __assign({ square: true, className: classes.suggestionsPaper }, containerProps), children)));
        };
        _this.renderSuggestionComponent = function (_a) {
            var suggestion = _a.suggestion, query = _a.query, isHighlighted = _a.isHighlighted, props = __rest(_a, ["suggestion", "query", "isHighlighted"]);
            return React.createElement("div", __assign({}, props));
        };
        _this.renderSuggestion = function (suggestion, _a) {
            var query = _a.query, isHighlighted = _a.isHighlighted;
            var label = _this.getSuggestionText(suggestion);
            var matches = match(label, query);
            var parts = parse(label, matches);
            var _b = _this.props, _c = _b.classes, classes = _c === void 0 ? {} : _c, suggestionComponent = _b.suggestionComponent;
            return (React.createElement(MenuItem, { selected: isHighlighted, component: suggestionComponent || _this.renderSuggestionComponent, suggestion: suggestion, query: query, isHighlighted: isHighlighted },
                React.createElement("div", null, parts.map(function (part, index) {
                    return part.highlight ? (React.createElement("span", { key: index, className: classes.highlightedSuggestionText }, part.text)) : (React.createElement("strong", { key: index, className: classes.suggestionText }, part.text));
                }))));
        };
        _this.handleFocus = function () {
            var input = _this.props.input;
            input && input.onFocus && input.onFocus();
        };
        _this.updateFilter = function (value) {
            var _a = _this.props, setFilter = _a.setFilter, choices = _a.choices;
            if (_this.previousFilterValue !== value) {
                if (setFilter) {
                    setFilter(value);
                }
                else {
                    _this.setState({
                        searchText: value,
                        suggestions: choices.filter(function (choice) {
                            return _this.getSuggestionText(choice)
                                .toLowerCase()
                                .includes(value.toLowerCase());
                        }),
                    });
                }
            }
            _this.previousFilterValue = value;
        };
        _this.shouldRenderSuggestions = function (val) {
            var shouldRenderSuggestions = _this.props.shouldRenderSuggestions;
            if (shouldRenderSuggestions !== undefined &&
                typeof shouldRenderSuggestions === 'function') {
                return shouldRenderSuggestions(val);
            }
            return true;
        };
        return _this;
    }
    AutocompleteArrayInput.prototype.componentWillMount = function () {
        this.setState({
            inputValue: this.getInputValue(this.props.input.value),
            suggestions: this.props.choices,
        });
    };
    AutocompleteArrayInput.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        var choices = nextProps.choices, input = nextProps.input, inputValueMatcher = nextProps.inputValueMatcher;
        if (!isEqual(this.getInputValue(input.value), this.state.inputValue)) {
            this.setState({
                inputValue: this.getInputValue(input.value),
                dirty: false,
                suggestions: this.props.choices,
            });
            // Ensure to reset the filter
            this.updateFilter('');
        }
        else if (!isEqual(choices, this.props.choices)) {
            this.setState(function (_a) {
                var searchText = _a.searchText;
                return ({
                    suggestions: choices.filter(function (suggestion) {
                        return inputValueMatcher(searchText, suggestion, _this.getSuggestionText);
                    }),
                });
            });
        }
    };
    AutocompleteArrayInput.prototype.updateAnchorEl = function () {
        if (!this.inputEl) {
            return;
        }
        var inputPosition = this.inputEl.getBoundingClientRect();
        if (!this.anchorEl) {
            this.anchorEl = { getBoundingClientRect: function () { return inputPosition; } };
        }
        else {
            var anchorPosition = this.anchorEl.getBoundingClientRect();
            if (anchorPosition.x !== inputPosition.x ||
                anchorPosition.y !== inputPosition.y) {
                this.anchorEl = { getBoundingClientRect: function () { return inputPosition; } };
            }
        }
    };
    AutocompleteArrayInput.prototype.render = function () {
        var _a = this.props, alwaysRenderSuggestions = _a.alwaysRenderSuggestions, _b = _a.classes, classes = _b === void 0 ? {} : _b, isRequired = _a.isRequired, label = _a.label, meta = _a.meta, resource = _a.resource, source = _a.source, className = _a.className, options = _a.options;
        var _c = this.state, suggestions = _c.suggestions, searchText = _c.searchText;
        return (React.createElement(Autosuggest, { theme: {
                container: classes.container,
                suggestionsContainerOpen: classes.suggestionsContainerOpen,
                suggestionsList: classes.suggestionsList,
                suggestion: classes.suggestion,
            }, renderInputComponent: this.renderInput, suggestions: suggestions, alwaysRenderSuggestions: alwaysRenderSuggestions, onSuggestionSelected: this.handleSuggestionSelected, onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested, onSuggestionsClearRequested: this.handleSuggestionsClearRequested, renderSuggestionsContainer: this.renderSuggestionsContainer, getSuggestionValue: this.getSuggestionText, renderSuggestion: this.renderSuggestion, shouldRenderSuggestions: this.shouldRenderSuggestions, inputProps: {
                blurBehavior: 'add',
                className: className,
                classes: classes,
                isRequired: isRequired,
                label: label,
                meta: meta,
                onChange: this.handleChange,
                resource: resource,
                source: source,
                value: searchText,
                onFocus: this.handleFocus,
                options: options,
            } }));
    };
    return AutocompleteArrayInput;
}(React.Component));
export { AutocompleteArrayInput };
AutocompleteArrayInput.propTypes = {
    allowEmpty: PropTypes.bool,
    alwaysRenderSuggestions: PropTypes.bool,
    choices: PropTypes.arrayOf(PropTypes.object),
    classes: PropTypes.object,
    className: PropTypes.string,
    InputProps: PropTypes.object,
    input: PropTypes.object,
    inputValueMatcher: PropTypes.func,
    isRequired: PropTypes.bool,
    label: PropTypes.string,
    limitChoicesToValue: PropTypes.bool,
    meta: PropTypes.object,
    options: PropTypes.object,
    optionText: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
        .isRequired,
    optionValue: PropTypes.string.isRequired,
    resource: PropTypes.string,
    setFilter: PropTypes.func,
    shouldRenderSuggestions: PropTypes.func,
    source: PropTypes.string,
    suggestionComponent: PropTypes.func,
    translate: PropTypes.func.isRequired,
    translateChoice: PropTypes.bool.isRequired,
};
AutocompleteArrayInput.defaultProps = {
    choices: [],
    options: {},
    optionText: 'name',
    optionValue: 'id',
    limitChoicesToValue: false,
    translateChoice: true,
    inputValueMatcher: function (input, suggestion, getOptionText) {
        return getOptionText(suggestion)
            .toLowerCase()
            .trim()
            .includes(input.toLowerCase().trim());
    },
};
export default compose(addField, translate, withStyles(styles))(AutocompleteArrayInput);
